const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// -----------------------------------------------------------------
// [GET] ดึงสินค้าทั้งหมด
// -----------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET Products Error:", err);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// [POST] เพิ่มสินค้าใหม่ (รองรับการส่งมา 1 ชิ้น {} และหลายชิ้นรวดเดียว [])
// -----------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    // กรณีที่ 1: ถ้าส่งข้อมูลมาเป็นก้อน Array (เช่น [{}, {}, {}])
    if (Array.isArray(req.body)) {
      const insertedProducts = [];
      
      // วนลูป Insert ลง Database ทีละรายการ
      for (const item of req.body) {
        const { productCode, productName, description, imageUrl, price, stockQuantity, categoryId } = item;
        const result = await pool.query(
          `INSERT INTO products (productcode, productname, description, imageurl, price, stockquantity, categoryid) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [productCode, productName, description, imageUrl, price, stockQuantity, categoryId]
        );
        insertedProducts.push(result.rows[0]);
      }
      return res.json(insertedProducts); // ส่งผลลัพธ์ที่เพิ่มสำเร็จกลับไป
      
    } 
    // กรณีที่ 2: ถ้าส่งข้อมูลมาชิ้นเดียวแบบ Object ปกติ ({})
    else {
      const { productCode, productName, description, imageUrl, price, stockQuantity, categoryId } = req.body;
      const result = await pool.query(
        `INSERT INTO products (productcode, productname, description, imageurl, price, stockquantity, categoryid) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [productCode, productName, description, imageUrl, price, stockQuantity, categoryId]
      );
      return res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("POST Products Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// -----------------------------------------------------------------
// [PUT] อัปเดตข้อมูลสินค้า (แก้ไขปัญหาข้อมูล undefined)
// -----------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { productCode, productName, description, imageUrl, price, stockQuantity, categoryId } = req.body;
  
  try {
    // ป้องกัน Error จาก pg โดยการแปลง undefined ให้เป็น null ให้หมด
    const result = await pool.query(
      `UPDATE products 
       SET productcode = COALESCE($1, productcode), 
           productname = COALESCE($2, productname), 
           description = COALESCE($3, description), 
           imageurl = COALESCE($4, imageurl), 
           price = COALESCE($5, price), 
           stockquantity = COALESCE($6, stockquantity), 
           categoryid = COALESCE($7, categoryid)
       WHERE id = $8 RETURNING *`,
      [
        productCode === undefined ? null : productCode,
        productName === undefined ? null : productName,
        description === undefined ? null : description,
        imageUrl === undefined ? null : imageUrl,
        price === undefined ? null : price,
        stockQuantity === undefined ? null : stockQuantity,
        categoryId === undefined ? null : categoryId,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้ารหัสนี้" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// -----------------------------------------------------------------
// [DELETE] ลบสินค้า 
// -----------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ message: "ลบสินค้าสำเร็จแล้ว" });
  } catch (err) {
    console.error("DELETE Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;