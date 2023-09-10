const mysql = require('mysql');
const dotenv = require('dotenv').config();

const db = mysql.createConnection({
	        host: process.env.HOST,
	        user: process.env.USERNAME,
	        password: process.env.PASSWORD
});

db.connect(function(err) {
	        if (err) throw err;

	        db.query('CREATE DATABASE IF NOT EXISTS identity;');
	       // db.query('USE identity;');
	        db.query('CREATE TABLE IF NOT EXISTS users(id int NOT NULL AUTO_INCREMENT, name varchar(30), username varchar(30), email varchar(255), age int, password varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
			                console.log(result);
	        });
//	       db.end();
});

module.exports = db;
