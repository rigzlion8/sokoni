const mysql2 = require('mysql2');
const dotenv = require('dotenv').config()

//import con from './db.js';

const conProduct = mysql2.createPool({
	host: process.env.HOST,
        user: process.env.USERNAME, 
        password: process.env.PASSWORD, 
        database: process.env.PRODUCTDATABASE
    }).promise()

// get products
const getProducts = async function() {
  const [rows] = await conProduct.query('SELECT * FROM products');
  return rows;
} 

// get product by Id
const getProduct = async function(id) {
  const [rows] = await conProduct.query(`
  SELECT * 
  FROM products 
  WHERE id = ?
  `, [id]);
  return rows[0];
}

//create product
const createProduct = async function(name, description, price, imageUrl, code, quantity) {
  const result = await conProduct.query(`
  INSERT INTO products (name, description, price, imageUrl, code, quantity) 
  VALUES (?, ?, ?, ?, ?, ?)
  `, [name, description, price, imageUrl, code, quantity]);
  const id = result.insertId;
  return getProduct(id);
}

module.exports = { conProduct, createProduct, getProducts, getProduct };
