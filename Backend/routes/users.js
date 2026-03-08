const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware'); 

// [GET] ดึงข้อมูล Profile ของตัวเอง
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user; 
    const result = await pool.query(
      'SELECT id, username, firstname, lastname, email, phone, address FROM users WHERE id=$1', 
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET Profile Error:", err);
    res.status(500).send("Server Error");
  }
});

// [PUT] อัปเดตข้อมูล Profile ตัวเอง
router.put('/profile', auth, async (req, res) => {
  console.log("--- 📥 มีการเรียกใช้ PUT /users/profile ---");
  console.log("1. ข้อมูลที่ส่งมา (req.body):", req.body);
  console.log("2. ข้อมูลผู้ใช้จาก Token (req.user):", req.user);

  const { firstname, lastname, email, phone, address } = req.body;
  
  // พยายามดึง ID ออกมา
  const userId = req.user?.id || req.user?.userId || (typeof req.user === 'number' || typeof req.user === 'string' ? req.user : null);
  console.log("3. สกัด User ID ได้คือ:", userId);

  if (!userId) {
    console.log("❌ Error: หา User ID ไม่เจอ กรุณาเช็ค authMiddleware");
    return res.status(401).json({ message: "หา ID ผู้ใช้ไม่พบ" });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET firstname=$1, 
           lastname=$2, 
           email=$3, 
           phone=$4, 
           address=$5 
       WHERE id=$6 
       RETURNING id, username, firstname, lastname, email, phone, address`,
      [
        firstname || null, 
        lastname || null, 
        email || null, 
        phone || null, 
        address || null, 
        userId
      ]
    );

    if (result.rows.length === 0) {
      console.log("❌ Error: อัปเดตไม่ได้ ไม่พบ User ID ใน Database");
      return res.status(404).json({ message: "ไม่พบผู้ใช้งานในระบบ" });
    }

    console.log("✅ อัปเดตสำเร็จ! ข้อมูลใหม่คือ:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT Profile SQL Error เกิดข้อผิดพลาดที่ฐานข้อมูล:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;