const pool = require('../config/db')

exports.getCustomers = async(req,res)=>{
const result = await pool.query("SELECT * FROM customers")
res.json(result.rows)
}

exports.createCustomer = async(req,res)=>{
const {customerCode,firstName,lastName,email,phone}=req.body

const result = await pool.query(
"INSERT INTO customers(customerCode,firstName,lastName,email,phone) VALUES($1,$2,$3,$4,$5) RETURNING *",
[customerCode,firstName,lastName,email,phone]
)

res.json(result.rows[0])
}

exports.deleteCustomer = async(req,res)=>{
await pool.query("DELETE FROM customers WHERE id=$1",[req.params.id])
res.json({message:"deleted"})
}