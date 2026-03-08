const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/', async (req, res) => {

try {

const result = await pool.query('SELECT * FROM customers')
res.json(result.rows)

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}

})

router.get('/:id', async (req, res) => {

const { id } = req.params

try {

const result = await pool.query(
'SELECT * FROM customers WHERE id=$1',
[id]
)

res.json(result.rows[0])

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}

})

router.post('/', async (req, res) => {

const {
customerCode,
firstName,
lastName,
email,
phone
} = req.body

try {

const result = await pool.query(
`INSERT INTO customers(
customerCode,
firstName,
lastName,
email,
phone
)
VALUES($1,$2,$3,$4,$5)
RETURNING *`,
[
customerCode,
firstName,
lastName,
email,
phone
]
)

res.json(result.rows[0])

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}

})

router.put('/:id', async (req, res) => {

const { id } = req.params

const {
customerCode,
firstName,
lastName,
email,
phone
} = req.body

try {

const result = await pool.query(
`UPDATE customers
SET customerCode=$1,
firstName=$2,
lastName=$3,
email=$4,
phone=$5
WHERE id=$6
RETURNING *`,
[
customerCode,
firstName,
lastName,
email,
phone,
id
]
)

res.json(result.rows[0])

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}

})

router.delete('/:id', async (req, res) => {

const { id } = req.params

try {

await pool.query(
'DELETE FROM customers WHERE id=$1',
[id]
)

res.json({message:"Customer deleted"})

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}

})

module.exports = router