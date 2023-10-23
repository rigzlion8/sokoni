const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv').config();
const User = require('./models/user');
const sequelize = require('./config');

// Google authentication
passport.use(new GoogleStrategy({
	    clientID: process.env.GOOGLE_CLIENT_ID,
	    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/google/callback", 
	    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],

	    passReqToCallback   : true
	  },
function(request, accessToken, refreshToken, profile, done) {
  const { id, emails } = profile;
//  const displayName = profile.displayName || '';
	console.log(profile);

  const oAuthProvider = 'Google';

  User.findOrCreate({ 
    where: { oAuthUserId: id }, 
    defaults: { 
      name: profile.displayName, 
      email: emails[0].value, 
      oAuthProvider, 
      profile: profile._json, 
    },
  })

    .then(([user]) => { 
	console.log('User found or created:', user);
      // return done(null, profile);
      done(null, user);
    })
    .catch((error) => {
	    console.error('Error while finding or creating user:', error);
      done(error, null);
    });
}));

passport.serializeUser(function(user, done) {
	    done(null , user.id);  // _id is the only thing we need to store in session for now
});

passport.deserializeUser(function(id, done) {
  // Retrieve the user from the database using 'id' and pass it to 'done'
   User.findByPk(id)
     .then((user) => {
       done(null, user); // Deserialize the user
     })
     .catch((error) => {
       done(error, null);
     });
});


// This is old deserializeUser function
//passport.deserializeUser(function(user, done) {
//	    done(null , user);  // _id is the only thing we need to store in session for now
//})

// Twitter authentication
passport.use(new TwitterStrategy({
	    consumerKey:process.env.TWITTER_CONSUMER_KEY,
	    consumerSecret:process.env.TWITTER_CONSUMER_SECRET,
	    callbackURL:"https://sokoni.innovatenbo.tech/twitter/callback"
	  },
	function(token, tokenSecret, profile, cb) {
          return done(null, profile);
    }
));
passport.serializeUser(function(user, cb) {
	            done(null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
	            done(null , user);  // _id is the only thing we need to store in session for now
})

//Facebook authentication
passport.use(new FacebookStrategy({
	    clientID: process.env.FACEBOOK_APP_ID,
	    clientSecret: process.env.FACEBOOK_APP_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/facebook/callback",
	enableProof: true
	  },
	  function(accessToken, refreshToken, profile, cb) {
			            return done(null, profile);
		    }
));
passport.serializeUser(function(user, cb) {
                    done(null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
                    done(null , user);  // _id is the only thing we need to store in session for now
})
