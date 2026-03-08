const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- 1. ดึง path มาใช้งาน
const initDB = require('./models/initDB');

const app = express();

// Middleware พื้นฐาน
app.use(cors());
app.use(express.json());

// =========================================================
// 2. อนุญาตให้อ่านไฟล์รูปในโฟลเดอร์ uploads (ต้องวางไว้ตรงนี้!)
// =========================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes ต่างๆ ของระบบ
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));

// Initialize DB and Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
});