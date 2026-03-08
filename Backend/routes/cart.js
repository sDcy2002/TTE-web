const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware'); 

router.post('/checkout', auth, async (req, res) => {
  // รับค่า shippingAddress มาจาก Frontend
  const { cart, shippingAddress } = req.body;
  if (!cart || cart.length === 0) return res.json({ total: 0 });

  const client = await pool.connect(); 

  try {
    await client.query('BEGIN'); 
    const ids = cart.map(item => item.id);
    const sql = `SELECT id, price, stockQuantity FROM products WHERE id = ANY($1) FOR UPDATE`;
    const result = await client.query(sql, [ids]);
    const productsFromDb = result.rows;

    let total = 0;
    const itemsDetail = [];

    for (const product of productsFromDb) {
      const itemInCart = cart.find(c => c.id === product.id);
      if (itemInCart) {
        const currentStock = product.stockquantity || 0; 
        if (currentStock < itemInCart.qty) {
          throw new Error(`สินค้า "${itemInCart.productName}" มีจำนวนไม่พอ (เหลือ ${currentStock} ชิ้น)`);
        }
        const subtotal = parseFloat(product.price) * itemInCart.qty;
        total += subtotal;
        itemsDetail.push({
          id: product.id, productName: itemInCart.productName, qty: itemInCart.qty, price: product.price, imageUrl: itemInCart.imageUrl
        });

        const newStock = currentStock - itemInCart.qty;
        await client.query(`UPDATE products SET stockQuantity = $1 WHERE id = $2`, [newStock, product.id]);
      }
    }

    const randomOrderId = `TTE-${Math.floor(Math.random() * 900000) + 100000}`;
    
    // บันทึก shippingAddress ลงตาราง orders
    await client.query(
      `INSERT INTO orders (ordercode, userid, totalamount, status, items, shippingaddress) VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomOrderId, req.user.id, total, 'Completed', JSON.stringify(itemsDetail), shippingAddress || 'ไม่ระบุที่อยู่']
    );

    await client.query('COMMIT'); 

    res.json({
      total: total,
      items: itemsDetail,
      orderId: randomOrderId 
    });

  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error("Checkout Transaction Error:", err);
    res.status(400).json({ message: err.message || "Checkout Error" });
  } finally {
    client.release(); 
  }
});

module.exports = router;