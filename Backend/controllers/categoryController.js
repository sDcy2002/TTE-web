const pool = require('../config/db')

exports.getCategories = async(req,res)=>{
const result = await pool.query("SELECT * FROM categories")
res.json(result.rows)
}

exports.createCategory = async(req,res)=>{
const {categoryName,description} = req.body
const result = await pool.query(
"INSERT INTO categories(categoryName,description) VALUES($1,$2) RETURNING *",
[categoryName,description]
)
res.json(result.rows[0])
}

exports.updateCategory = async(req,res)=>{
const id = req.params.id
const {categoryName,description} = req.body

const result = await pool.query(
"UPDATE categories SET categoryName=$1,description=$2 WHERE id=$3 RETURNING *",
[categoryName,description,id]
)

res.json(result.rows[0])
}

exports.deleteCategory = async(req,res)=>{
await pool.query("DELETE FROM categories WHERE id=$1",[req.params.id])
res.json({message:"deleted"})
}