const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // ดึง pool มาจากจุดศูนย์กลาง
const authController = require('../controllers/authController'); // ใช้ Controller ที่มีอยู่

// ใช้ฟังก์ชันจาก Controller ที่คุณเขียนไว้แล้ว
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;