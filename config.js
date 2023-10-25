const dotenv = require('dotenv').config();
const mysql = require('mysql2');
//const mysql = require('mysql');

console.log('DBNAME:', process.env.DBNAME);
console.log('USERNAME:', process.env.USERNAME);
console.log('HOST:', process.env.HOST);

const con = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USERNAME, 
    password: process.env.PASSWORD, 
    database: process.env.USERDATABASE
}).promise()

const getOauthUsers = async function () {
    const [rows] = await con.query('SELECT * FROM users');
    return rows;
}

const getOauthUser = async function(oAuthUserId) {
    const [rows] = await con.query(`
    SELECT * 
    FROM users 
    WHERE id = ?
    `, [oAuthUserId]);
    return rows[0];
}

const createOauthUser = async function(name, oAuthEmail, oAuthUserId, oAuthProvider, imageurl){
    const result = await con.query(`INSERT IGNORE INTO users (name, oAuthEmail, oAuthUserId, oAuthProvider, imageurl) 
    VALUES (?, ?, ?, ?, ?)`, [name, oAuthEmail, oAuthUserId, oAuthProvider, imageurl]);
    const id = result.insertId;
    return getOauthUser(oAuthUserId);
}
const createOauthTwitter = async function(name, oAuthUserId, oAuthProvider, imageurl){
	    const result = await con.query(`INSERT IGNORE INTO users (name, oAuthUserId, oAuthProvider, imageurl)
	        VALUES (?, ?, ?, ?)`, [name, oAuthUserId, oAuthProvider, imageurl]);
	    const id = result.insertId;
	    return getOauthUser(oAuthUserId);
}

const createOauthFb = async function(oAuthUserId, name, oAuthProvider){
	            const result = await con.query(`INSERT IGNORE INTO users (oAuthUserId, name, oAuthProvider)
                    VALUES (?, ?, ?)`, [oAuthUserId, name, oAuthProvider]);
                const id = result.insertId;
            return getOauthUser(oAuthUserId);
}
module.exports = { con, getOauthUsers, getOauthUser, createOauthUser, createOauthTwitter, createOauthFb };
