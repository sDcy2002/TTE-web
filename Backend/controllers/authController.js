const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async(req,res)=>{

const {username,password} = req.body

const hash = await bcrypt.hash(password,10)

const result = await pool.query(
"INSERT INTO users(username,password) VALUES($1,$2) RETURNING *",
[username,hash]
)

res.json(result.rows[0])
}

exports.login = async(req,res)=>{

const {username,password} = req.body

const result = await pool.query(
"SELECT * FROM users WHERE username=$1",
[username]
)

if(result.rows.length==0)
return res.status(401).json({message:"user not found"})

const user = result.rows[0]

const valid = await bcrypt.compare(password,user.password)

if(!valid)
return res.status(401).json({message:"wrong password"})

const token = jwt.sign(
{id:user.id},
process.env.JWT_SECRET || "secret",
{expiresIn:"1d"}
)

res.json({token})
}