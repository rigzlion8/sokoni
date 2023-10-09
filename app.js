const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const dotenv = require('dotenv').config();
const path = require('path');
const passport = require('passport');

const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

const stripe = require('stripe')(SECRET_KEY);

const app = express();

const db = require('./db');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'EybtbYWy0XT8oof567Qhb53ZEAAUhxz9', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./auth');

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}


// register route
 app.get('/register', (req, res) => {
     res.render('register', { message: 'Redirecting...Please wait' });
});


// Signup route
app.get('/signup', (req, res) => {
   res.render('signup', { message: req.flash('signupMessage') });
});

const bcrypt = require('bcrypt');

app.post('/signup', (req, res) => {
  const { name, username, email, age, password, confirmPassword } = req.body;

	//Check if passwords match
   if (password !== confirmPassword) {
       req.flash('signupMessage', 'Passwords do not match. Try again');
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


// home route
app.get('/home', (req, res) => {
       res.render('home', { message: 'Redirecting...Please wait' });
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
        res.render('dashboard', { user });
		//res.send(`Hello ${req.user.displayName}`);
});

// cart route
app.get('/cart', (req, res) => {
      // Check if the user is authenticated (e.g., by checking session or JWT)
      //         if (!req.isAuthenticated()) {
         if (!req.session || !req.session.user) {
              // Redirect unauthenticated users to the login page
            return res.redirect('/login');
          }
         const user = req.session.user;

	// Render the dashboard view

	res.render('cart', { user });
});

// payment page
app.get('/checkout', (request, response) => {
    response.render('payment', {
        key:PUBLISHABLE_KEY
    })
});


// payment route
app.post('/payment', (request, response) => {
    stripe.customers.create({
        email:request.body.stripeEmail,
        source:request.body.stripeToken,
        name: 'Rigz Lion',
        address: {
            line1: 'Kariuki Drive off Limuru road',
            postal_code: '00100',
            city: 'Nairobi',
            state: 'Nairobi',
            country: 'Kenya'
        }
    })
    .then((customer) => {
        return stripe.charges.create({
            amount:7000,
            description: 'Web development 101',
            currency: 'USD',
            customer: customer.id
        })
    })
    .then((charge) => {
        console.log(charge)
        response.send('Success! Payment received.')
    })
    .catch((err) => {
        response.send(err)
    })
});


// Authenticate with google
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/google/callback', 
  passport.authenticate('google', { successRedirect: '/protected', 
  failureRedirect: '/auth/failure',
 })
);

app.get('/auth/failure', (req, res) => {
    res.send('Oops! something went wrong...');
})

//Protected page unless authenticated
app.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('Goodbye!');
});

// Authenticate with Twitter
app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/home', 
	  failureRedirect: '/login',
  })
  //function(req, res) {
  //// Successful authentication, redirect home.
  //   res.redirect('/protected');
);


const port = process.env.PORT || 5000;
app.listen(port, () => {
	  console.log(`Server up and running on port ${port}`);
});


//Authenticate via facebook
app.get('/auth/facebook',
	  passport.authenticate('facebook'));

app.get('/facebook/callback',
	  passport.authenticate('facebook', { successRedirect: '/home', 
		  failureRedirect: '/login'
	  })
	//  function(req, res) {
		      // Successful authentication, redirect home.
		  //     res.redirect('/');
);
