const express = require('express');
const cors = require('cors');
const path = require('path');
const initDB = require('./models/initDB');

const app = express();

// =========================================================
// 1. ตั้งค่า EJS เป็น View Engine (ตัวสร้างหน้าเว็บ)
// =========================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =========================================================
// 2. Middleware พื้นฐาน
// =========================================================
// ปรับ CORS ให้รับได้หมด เพราะตอนนี้ Frontend กับ Backend อยู่บ้านเดียวกันแล้ว
app.use(cors()); 
app.use(express.json());

// =========================================================
// 3. เปิดทางให้ไฟล์ Static (สำคัญมาก! เพื่อให้โหลด CSS และ JS ได้)
// =========================================================
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================
// 4. API Routes (ระบบหลังบ้านที่คุยกับ Database)
// =========================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));

// =========================================================
// 5. Page Routes (เส้นทางสำหรับส่งหน้าเว็บ EJS ให้ผู้ใช้งาน)
// =========================================================
app.get('/', (req, res) => res.render('home'));
app.get('/products', (req, res) => res.render('products'));
app.get('/cart', (req, res) => res.render('cart'));
app.get('/register', (req, res) => res.render('register'));
app.get('/profile', (req, res) => res.render('profile'));
app.get('/admin/dashboard', (req, res) => res.render('adminDashboard'));

// =========================================================
// 6. Initialize DB and Start Server
// =========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
});