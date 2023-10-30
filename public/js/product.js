import mysql2 from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

export const conProduct = mysql2.createPool({
	host: process.env.HOST,
        user: process.env.USERNAME, 
        password: process.env.PASSWORD, 
        database: process.env.PRODUCTDATABASE
    }).promise()

// get products
export const getProducts = async function() {
  const [rows] = await conProduct.query('SELECT * FROM products');
  return rows;
} 

// get product by Id
export const getProduct = async function(id) {
  const [rows] = await conProduct.query(`
  SELECT * 
  FROM products 
  WHERE id = ?
  `, [id]);
  return rows[0];
}

//create product
export const createProduct = async function(name, description, price, imageUrl, code, quantity) {
  const result = await conProduct.query(`
  INSERT INTO products (name, description, price, imageUrl, code, quantity) 
  VALUES (?, ?, ?, ?, ?, ?)
  `, [name, description, price, imageUrl, code, quantity]);
  const id = result.insertId;
  return getProduct(id);
}

