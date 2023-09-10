const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const dotenv = require('dotenv').config();

const app = express();

const db = require('./db');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'EybtbYWy0XT8oof567Qhb53ZEAAUhxz9', resave: false, saveUninitialized: true }));
app.use(flash());

// Signup route
app.get('/signup', (req, res) => {
   res.render('signup', { message: req.flash('signupMessage') });
});

const bcrypt = require('bcrypt');

app.post('/signup', (req, res) => {
  const { name, username, email, age, password, confirmPassword } = req.body;

	//Check if passwords match
   if (password !== confirmPassword) {
       req.flash('signupMessage', 'Passwords do not match');
       return res.redirect('/signup');
       }

       // Hash the password
   bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

       // Store user data in the database
        const newUser = {
              name,
              username,
              email,
              age,
              password: hashedPassword,
        };
	   console.log(newUser);
//db.connect(function(err) {
//	        if (err) throw err;

	        db.query('CREATE DATABASE IF NOT EXISTS identity;');
	        db.query('USE identity;');// Insert newUser into the database
   db.query('INSERT INTO users SET ?', newUser, (err, result) => {
         if (err) {

	// Handle duplicate username or other database errors
         if (err.code === 'ER_DUP_ENTRY') {
             req.flash('signupMessage', 'Username or email already exists');
         } else {
             req.flash('signupMessage', 'User registration failed');
                                                                                                                                 }
                                                                                                                                    res.redirect('/signup');
                                                                                                                                 } else {
                                                                                                                                    req.flash('loginMessage', 'Registration successful. Please log in.');
                                                                                                                                    res.redirect('/login');
                                                                                                                                  }
                                                                                                                                });
                                                                                                                             });
 });
//});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('loginMessage') });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

    // Fetch user from the database based on username
  // db.query('CREATE DATABASE IF NOT EXISTS identity;');
   db.query('USE identity;');
   db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
       if (err) throw err;

       if (!rows.length) {
         req.flash('loginMessage', 'User not found');
         return res.redirect('/login');
        }

        const user = rows[0];

        // Compare the hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
           if (err) throw err;

           if (isMatch) {
             // Authentication successful
             req.session.user = user;
             res.redirect('/dashboard'); // Redirect to the dashboard or another secure page
           } else {
             req.flash('loginMessage', 'Incorrect password');
             res.redirect('/login');
           }
         });
      });
});


// dashboard route
app.get('/dashboard', (req, res) => {
     // Check if the user is authenticated (e.g., by checking session or JWT)
//         if (!req.isAuthenticated()) {
	if (!req.session || !req.session.user) {
             // Redirect unauthenticated users to the login page
         return res.redirect('/login');
        }
	const user = req.session.user;

            // Render the dashboard view
                res.render('dashboard', { user }); // Replace 'dashboard' with your actual view name
        });


const port = process.env.PORT || 5000;
app.listen(port, () => {
	  console.log(`Server up and running on port ${port}`);
});
