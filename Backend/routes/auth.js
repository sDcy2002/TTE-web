const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// [POST] สมัครสมาชิก
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExist = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Username นี้มีผู้ใช้งานแล้ว" });
    }

    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, 'user') RETURNING id, username, role",
      [username, password] 
    );
    
    res.json({ message: "สมัครสมาชิกสำเร็จ", user: result.rows[0] });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// [POST] เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }

    const user = result.rows[0];
    const userRole = user.role || 'user'; // ดึงสิทธิ์จาก DB

    // ฝัง role ลงไปใน Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: userRole }, 
      process.env.JWT_SECRET || 'your_secret_key', 
      { expiresIn: '1d' }
    );

    // ส่งข้อมูล Role กลับไปให้ Frontend เก็บไว้ปรับหน้าตาเว็บ
    res.json({ 
      message: "เข้าสู่ระบบสำเร็จ", 
      token: token, 
      username: user.username,
      role: userRole 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;