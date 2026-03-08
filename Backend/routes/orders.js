const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// [GET] ดึงประวัติการสั่งซื้อของตัวเอง (สำหรับหน้า Profile ของ User)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const result = await pool.query('SELECT * FROM orders WHERE userid = $1 ORDER BY orderdate DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("GET My Orders Error:", err);
    res.status(500).send("Server Error");
  }
});

// [GET] ดึงข้อมูลคำสั่งซื้อ "ทั้งหมด" (สำหรับ Admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    // ดึงข้อมูลออเดอร์ พร้อม Join เอาชื่อ username จากตาราง users มาแสดงด้วย
    const result = await pool.query(`
      SELECT o.*, u.username, u.firstname, u.lastname 
      FROM orders o 
      LEFT JOIN users u ON o.userid = u.id 
      ORDER BY o.orderdate DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET All Orders Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;