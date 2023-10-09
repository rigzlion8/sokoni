const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv').config();


// Google authentication
passport.use(new GoogleStrategy({
	    clientID: process.env.GOOGLE_CLIENT_ID,
	    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/google/callback",
	    passReqToCallback   : true
	  },
	  function(request, accessToken, refreshToken, profile, done) {
		      
		        return done(null, profile);
		    }
));

passport.serializeUser(function(user, done) {
	    done (null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, done) {
	    done (null , user);  // _id is the only thing we need to store in session for now
})

// Twitter authentication
passport.use(new TwitterStrategy({
	    consumerKey:process.env.TWITTER_CONSUMER_KEY,
	    consumerSecret:process.env.TWITTER_CONSUMER_SECRET,
	    callbackURL:"https://sokoni.innovatenbo.tech/twitter/callback"
	  },
	function(token, tokenSecret, profile, cb) {
          return cb(null, profile);
    }
));
passport.serializeUser(function(user, cb) {
	            cb (null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
	            cb (null , user);  // _id is the only thing we need to store in session for now
})

//Facebook authentication
passport.use(new FacebookStrategy({
	    clientID: process.env.FACEBOOK_APP_ID,
	    clientSecret: process.env.FACEBOOK_APP_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/facebook/callback",
	enableProof: true
	  },
	  function(accessToken, refreshToken, profile, cb) {
			            return cb(null, profile);
		    }
));
passport.serializeUser(function(user, cb) {
                    cb (null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
                    cb (null , user);  // _id is the only thing we need to store in session for now
})
