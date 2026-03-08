const pool = require('../config/db')

async function initDB(){
  await pool.query(`CREATE TABLE IF NOT EXISTS categories(id SERIAL PRIMARY KEY, categoryName VARCHAR(100), description TEXT)`)
  await pool.query(`CREATE TABLE IF NOT EXISTS products(id SERIAL PRIMARY KEY, productCode VARCHAR(50), productName VARCHAR(100), description TEXT, imageUrl TEXT, price NUMERIC, stockQuantity INT, categoryId INT REFERENCES categories(id))`)
  await pool.query(`CREATE TABLE IF NOT EXISTS customers(id SERIAL PRIMARY KEY, customerCode VARCHAR(50), firstName VARCHAR(100), lastName VARCHAR(100), email VARCHAR(100), phone VARCHAR(20))`)
  await pool.query(`CREATE TABLE IF NOT EXISTS orders(id SERIAL PRIMARY KEY, orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, totalAmount NUMERIC, status VARCHAR(50), customerId INT REFERENCES customers(id), productId INT REFERENCES products(id))`)
  await pool.query(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, username VARCHAR(50), password VARCHAR(255))`)

  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS firstname VARCHAR(100);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS lastname VARCHAR(100);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
    
    // ---> เพิ่มคอลัมน์ role โดยให้ทุกคนที่สมัครใหม่มีค่าเริ่มต้นเป็น 'user' <---
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';");

    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS userid INT REFERENCES users(id);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordercode VARCHAR(50);');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shippingaddress TEXT;');

    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS imageurl TEXT;');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS stockquantity INT;');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS categoryid INT;');
  } catch (err) {
    console.log("DB Upgrade note:", err.message);
  }

  console.log("Database tables ready")
}
module.exports = initDB