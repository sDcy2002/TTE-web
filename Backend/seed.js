const pool = require('./config/db');

async function runSeed() {
  try {
    console.log("⏳ กำลังเตรียมความพร้อมและล้างข้อมูลเก่า...");
    
    // 1. ล้างข้อมูลเก่าทั้งหมดและรีเซ็ตค่า ID เริ่มที่ 1 (CASCADE เพื่อลบข้อมูลที่มีความสัมพันธ์กันด้วย)
    await pool.query('TRUNCATE TABLE orders, products, categories, users RESTART IDENTITY CASCADE;');
    console.log("✅ ล้างข้อมูลและรีเซ็ต ID สำเร็จ");

    // 2. สร้างข้อมูล "หมวดหมู่สินค้า"
    console.log("⏳ กำลังเพิ่มข้อมูล หมวดหมู่สินค้า...");
    await pool.query(`
      INSERT INTO categories (categoryName, description) VALUES 
      ('เครื่องมือช่าง', 'อุปกรณ์และเครื่องมือช่างพื้นฐาน เช่น สว่าน ค้อน ประแจ'),
      ('อุปกรณ์ไฟฟ้า', 'สายไฟ ปลั๊กไฟ สวิตช์ และอุปกรณ์ไฟฟ้าอื่นๆ'),
      ('ฮาร์ดแวร์', 'น็อต สกรู บานพับ และอุปกรณ์ยึดติด'),
      ('สีและเคมีภัณฑ์', 'สีทาอาคาร กาว น้ำยาทำความสะอาด')
    `);

    // 3. สร้างข้อมูล "สินค้า" (categoryId จะอ้างอิงจากลำดับด้านบน)
    console.log("⏳ กำลังเพิ่มข้อมูล สินค้า...");
    await pool.query(`
      INSERT INTO products (productCode, productName, description, price, stockQuantity, categoryId) VALUES 
      ('TTE-001', 'สว่านไฟฟ้าไร้สาย 20V', 'สว่านแบตเตอรี่ 20V พร้อมดอกสว่านเจาะไม้และเหล็ก', 1290, 50, 1),
      ('TTE-002', 'ชุดประแจอเนกประสงค์', 'ประแจแหวนข้างปากตาย 14 ชิ้น ผลิตจากเหล็ก CR-V', 450, 100, 1),
      ('TTE-003', 'สายไฟ VAF 2x2.5', 'สายไฟม้วน 100 เมตร มาตรฐาน มอก. สำหรับเดินลอย', 1850, 30, 2),
      ('TTE-004', 'หลอดไฟ LED 9W', 'หลอดไฟแสงสีขาว (Daylight) ประหยัดพลังงาน', 85, 200, 2),
      ('TTE-005', 'คีมตัดสายไฟ 8 นิ้ว', 'คีมตัดเหล็กคุณภาพสูง ด้ามจับหุ้มฉนวนกันไฟ', 220, 80, 1),
      ('TTE-006', 'ปลั๊กพ่วงกันไฟกระชาก', 'ปลั๊กพ่วง 5 ช่อง ยาว 3 เมตร มีสวิตช์แยก', 350, 60, 2)
    `);

    // 4. สร้างข้อมูล "ผู้ใช้งาน" (แอดมิน 1 คน, ลูกค้า 1 คน)
    console.log("⏳ กำลังเพิ่มข้อมูล ผู้ใช้งาน...");
    await pool.query(`
      INSERT INTO users (username, password, firstname, lastname, role, email, phone, address) VALUES 
      ('admin', '123456', 'ผู้ดูแล', 'ระบบ', 'admin', 'admin@ttestore.com', '0800000000', 'บริษัท TTE-STORE สำนักงานใหญ่'),
      ('user1', '123456', 'สมชาย', 'ใจดี', 'user', 'somchai@email.com', '0811111111', '123 ซอยพัฒนาการ เขตสวนหลวง กรุงเทพมหานคร 10250')
    `);

    // 5. สร้างข้อมูล "รายการสั่งซื้อจำลอง" (เพื่อให้หน้า Dashboard ของ Admin มีสถิติแสดงทันที)
    console.log("⏳ กำลังเพิ่มข้อมูล คำสั่งซื้อจำลอง...");
    await pool.query(`
      INSERT INTO orders (ordercode, userid, totalamount, status, items, shippingaddress, orderdate) VALUES 
      ('TTE-550123', 2, 1290, 'Completed', '[{"id":1,"qty":1,"price":"1290","productName":"สว่านไฟฟ้าไร้สาย 20V"}]', '123 ซอยพัฒนาการ เขตสวนหลวง กรุงเทพมหานคร 10250', NOW() - INTERVAL '2 days'),
      ('TTE-550124', 2, 620, 'Completed', '[{"id":2,"qty":1,"price":"450","productName":"ชุดประแจอเนกประสงค์"},{"id":4,"qty":2,"price":"85","productName":"หลอดไฟ LED 9W"}]', '123 ซอยพัฒนาการ เขตสวนหลวง กรุงเทพมหานคร 10250', NOW() - INTERVAL '1 hours')
    `);

    console.log("🎉 เพิ่มข้อมูล Seed เข้าสู่ระบบสำเร็จเรียบร้อยแล้ว!");

  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการรัน Seed:", err.message);
  } finally {
    process.exit(); // สั่งให้โปรแกรมจบการทำงานทันทีเมื่อเสร็จสิ้น
  }
}

runSeed();