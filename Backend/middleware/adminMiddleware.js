// ต้องให้ authMiddleware ทำงานก่อนเสมอ เพื่อให้เรารู้ว่า req.user คือใคร
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "ปฏิเสธการเข้าถึง! พื้นที่นี้สำหรับผู้ดูแลระบบเท่านั้น" });
  }
};

module.exports = adminAuth;