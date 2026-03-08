const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/authMiddleware')

// ดึงประวัติการสั่งซื้อของตัวเองเท่านั้น
router.get('/my-orders', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE userid=$1 ORDER BY orderdate DESC', [req.user.id])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).send("Server Error")
  }
})

module.exports = router