const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware'); 
const adminAuth = require('../middleware/adminMiddleware'); // <--- ดึงยามแอดมินมาใช้

// [GET] ดึงข้อมูลผู้ใช้งาน "ทั้งหมด" (สำหรับ Admin เท่านั้น)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, firstname, lastname, email, phone, address, role FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET All Users Error:", err);
    res.status(500).send("Server Error");
  }
});

// [GET] ดึงข้อมูล Profile ของตัวเอง (สำหรับ User ทั่วไป)
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user; 
    const result = await pool.query('SELECT id, username, firstname, lastname, email, phone, address, role FROM users WHERE id=$1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET Profile Error:", err);
    res.status(500).send("Server Error");
  }
});

// [PUT] อัปเดตข้อมูล Profile ตัวเอง
router.put('/profile', auth, async (req, res) => {
  const { firstname, lastname, email, phone, address } = req.body;
  const userId = req.user.id || req.user.userId || req.user; 

  try {
    const result = await pool.query(
      `UPDATE users SET firstname=$1, lastname=$2, email=$3, phone=$4, address=$5 WHERE id=$6 RETURNING *`,
      [firstname || null, lastname || null, email || null, phone || null, address || null, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT Profile Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;