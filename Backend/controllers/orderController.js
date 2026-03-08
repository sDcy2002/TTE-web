const pool = require('../config/db')

exports.getOrders = async(req,res)=>{
const result = await pool.query("SELECT * FROM orders")
res.json(result.rows)
}

exports.createOrder = async(req,res)=>{
const {totalAmount,status,customerId,productId}=req.body

const result = await pool.query(
"INSERT INTO orders(totalAmount,status,customerId,productId) VALUES($1,$2,$3,$4) RETURNING *",
[totalAmount,status,customerId,productId]
)

res.json(result.rows[0])
}