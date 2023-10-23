const Sequelize = require('sequelize');
const dotenv = require('dotenv').config();
//const mysql2 = require('mysql2');
const mysql = require('mysql');

console.log('DBNAME:', process.env.DBNAME);
console.log('USERNAME:', process.env.USERNAME);
console.log('HOST:', process.env.HOST);


const sequelize = new Sequelize(process.env.DBNAME, process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
  dialectModule: require('mysql'),	
});
//console.log(sequelize);

try {
sequelize.authenticate()
  .then(() => {
	      console.log('Database connection has been established successfully.');
  })
  .catch((err) => {
	      console.error('Unable to connect to the database:', err);
  });

} catch (error) { 
	console.log('Error during db connection');
}

module.exports = sequelize;
