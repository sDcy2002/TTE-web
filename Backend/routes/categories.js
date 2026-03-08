const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/', async (req, res) => {
try {

const result = await pool.query('SELECT * FROM categories')
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
'SELECT * FROM categories WHERE id=$1',
[id]
)

res.json(result.rows[0])

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}
})

router.post('/', async (req, res) => {

const { categoryName, description } = req.body

try {

const result = await pool.query(
`INSERT INTO categories(categoryName,description)
VALUES($1,$2)
RETURNING *`,
[categoryName, description]
)

res.json(result.rows[0])

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}
})

router.put('/:id', async (req, res) => {

const { id } = req.params
const { categoryName, description } = req.body

try {

const result = await pool.query(
`UPDATE categories
SET categoryName=$1,
description=$2
WHERE id=$3
RETURNING *`,
[categoryName, description, id]
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
'DELETE FROM categories WHERE id=$1',
[id]
)

res.json({message:"Category deleted"})

} catch (err) {

console.error(err)
res.status(500).send("Server Error")

}
})

module.exports = router