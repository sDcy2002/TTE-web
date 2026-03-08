const db = require('../config/db');

const Product = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM products');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (product) => {
    const sql = `
      INSERT INTO products (productName, price, imageUrl) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    const values = [product.productName, product.price, product.imageUrl];
    const result = await db.query(sql, values);
    return result.rows[0];
  }
};

module.exports = Product;