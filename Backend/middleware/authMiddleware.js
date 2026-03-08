const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: "ไม่มี Token อนุญาตให้เข้าถึง" });
  }

  try {
    const actualToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    // ถอดรหัส Token (ควรใช้รหัสลับให้ตรงกับตอนสร้าง Token)
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'your_secret_key');
    
    // แนบข้อมูลผู้ใช้ (id, username, role) เข้าไปใน req.user
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Token ไม่ถูกต้อง หรือหมดอายุแล้ว" });
  }
};

module.exports = auth;