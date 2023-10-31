import mysql from 'mysql'
import mysql2 from 'mysql2'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import flash from 'express-flash'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()
import path from 'path'

import Stripe from 'stripe'

import { createOauthUser, getOauthUser, getOauthUsers, con } from './config.js'

import { passport, GoogleStrategy, FacebookStrategy, TwitterStrategy } from './auth.js'

import multer from 'multer'
import crypto from 'crypto'
import sharp from 'sharp'

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//function to rename image files before upload
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKeyId = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKeyId,
    },
    region: bucketRegion
});

upload.single('image')

export var getSigned;

//const { getUser, getUsers, createUser } = require('./db');
import { getProduct, getProducts, createProduct } from './public/js/product.js'

const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

const stripe = new Stripe(SECRET_KEY);


const app = express();

import { db } from './db.js'

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'EybtbYWy0XT8oof567Qhb53ZEAAUhxz9', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//require('./auth.js');

const isLoggedIn = function (req, res, next) {
  const oAuthUser = req.session;
  oAuthUser ? next() : res.sendStatus(401);
  //user ? next() : res.redirect('/register');
}

//admin page route
app.get('/', (req, res) => {
  res.render('pages/admin')
});

// create product route to create with image
app.get('/create', (req, res) => {
  res.render('pages/createProduct')
});

// test route
app.get('/test', (req, res) => {
  //res.send({ message: 'This is a test page that you have accessed.'});
	
  //console.log();
  res.send(getSigned);
  
});

// create product route with image
app.post('/create', upload.single('image'), createProduct, async (req, res) => {
    const  { name, description, price, code, quantity } = req.body;
    
    console.log('req.body', req.body)
    console.log('req.file', req.file)
    
    //resize image using sharp
    const buffer = await sharp(req.file.buffer).resize({height: 600, width: 600, fit: 'contain' }).toBuffer()
	    
    const imageName = randomImageName()

    const uploadParams = {
        Bucket: bucketName, 
        Key: imageName, // random image name generated before pushing to s3
        Body: buffer, 
        ContentType: req.file.mimetype,        
    }
	    
    const command = new PutObjectCommand(uploadParams) 
    console.log(req.body);
    console.log(command);
	    
    await s3.send(command) 

    const push = await createProduct(req.body.name, req.body.description, req.body.price, imageName, req.body.code, req.body.quantity )

    console.log(push);
	    
    res.redirect('/')
    //res.send({ message: 'Success' });
});

// get products route
app.get('/api/products', async (req, res) => {
    const products = await getProducts()

    for (const product of products) {
    const getObjectParams = {
        Bucket: bucketName, 
        Key: product.imageUrl,
    }
    //console.log(product);

	        
     const command = new GetObjectCommand(getObjectParams);
     const url = await getSignedUrl(s3, command, {expiresIn: 604800 });
     product.imageUrl = url
     }
     getSigned = products;

     res.send(products)
     //res.render('products', { shopItemsData: products });
});


// Authenticate with google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/google/callback',
  passport.authenticate('google', { successRedirect: '/dashboard',
       failureRedirect: '/register',
}));

app.get('/auth/failure', (req, res) => {
   res.send('Oops! something went wrong...');
});

//Protected page unless authenticated
app.get('/protected', isLoggedIn, (req, res) => {
   res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', function(req, res, next) {
   req.logout(function(err) {
     if (err) { return next(err); }
     req.session.destroy();
     res.redirect('/login');
   });
});

// register route
 app.get('/register', (req, res) => {
     res.render('register', { message: req.flash('loginMessage') });
});


// Signup route
app.get('/signup', (req, res) => {
   res.render('signup', { message: req.flash('signupMessage') });
});

app.post('/signup', (req, res) => {
  const { name, username, email, dateOfBirth, password, confirmPassword } = req.body;

	console.log(req.body);

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
              dateOfBirth,
              password: hashedPassword,
        };
	   console.log(newUser);
//db.connect(function(err) {
//	        if (err) throw err;

	        db.query('CREATE DATABASE IF NOT EXISTS identity;');
	        db.query('USE identity;');
	   // Insert newUser into the database
   db.query('INSERT IGNORE INTO users SET ?', newUser, (err, result) => {
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
       res.render('home');
});

// dashboard route
app.get('/dashboard', isLoggedIn, (req, res) => {

	if (!req.session) {
        // Redirect unauthenticated users to the login page
        return res.redirect('/login');
        }
	
	// Render the dashboard view
        res.render('dashboard');
	//res.send(`Hello ${req.user.displayName}`);
});

// cart route
app.get('/cart', isLoggedIn, (req, res) => {
      // Check if the user is authenticated (e.g., by checking session or JWT)
      //         if (!req.isAuthenticated()) {
         if (!req.session) {
              // Redirect unauthenticated users to the login page
            return res.redirect('/login');
          }
         const user = req.session.user;

	// Render the dashboard view

	res.render('cart');
});

// payment page
app.get('/checkout', (request, response) => {
    response.render('payment', {
        key:PUBLISHABLE_KEY
    })
});


// payment route
app.post('/payment', async (request, response) => {
    await stripe.customers.create({
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




// Authenticate with Twitter
app.get('/auth/twitter',
  passport.authenticate('twitter'));


app.get('/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/dashboard', 
	  failureRedirect: '/register',
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
	  passport.authenticate('facebook', { successRedirect: '/dashboard', 
		  failureRedirect: '/register'
	  })
	//  function(req, res) {
		      // Successful authentication, redirect home.
		  //     res.redirect('/');
);
