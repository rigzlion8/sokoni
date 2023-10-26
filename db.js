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
	       db.query('USE identity;');
	        db.query('CREATE TABLE IF NOT EXISTS users(id int NOT NULL AUTO_INCREMENT, name varchar(30), username varchar(30), email varchar(255), age int, password varchar(255), phoneNumber BIGINT UNIQUE, dateOfBirth DATE, firstName varchar(100), middleName varchar(100), lastName varchar(255), gender varchar(6), country varchar(45), nextOfKin varchar(50), isAdmin TINYINT, maritalStatus varchar(45), oAuthUserId varchar(255), oAuthProvider varchar(255), idNumber INT, passportNumber varchar(45), dateCreated DATETIME CURRENT_TIMESTAMP, dateModified DATETIME CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, nationality varchar(45), profile varchar(255), imageUrl varchar(255), oAuthEmail varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
			                console.log(result);
	        });
//	       db.end();
});

module.exports = db;
