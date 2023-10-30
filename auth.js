import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import dotenv from 'dotenv'
dotenv.config()
import  { con, createOauthUser, createOauthTwitter, createOauthFb, getOauthUser, getOauthUsers } from './config.js'

// Google authentication
passport.use(new GoogleStrategy({
	    clientID: process.env.GOOGLE_CLIENT_ID,
	    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/google/callback"
	  },

function(accessToken, refreshToken, profile, done) {
    const userProfile=profile;

    const name = userProfile['displayName']
    const oAuthEmail = userProfile['emails'][0]['value']
    const oAuthUserId = userProfile['id'] 
    const oAuthProvider = userProfile['provider']
    const imageUrl = userProfile['photos'][0]['value']
	        
    const oAuthUser = { name, oAuthEmail, oAuthUserId, oAuthProvider, imageUrl }
    createOauthUser(name, oAuthEmail, oAuthUserId, oAuthProvider, imageUrl)
    console.log(oAuthUser)
	             
    return done(null, userProfile);
    }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});
   
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Twitter authentication
passport.use(new TwitterStrategy({
	    consumerKey:process.env.TWITTER_CONSUMER_KEY,
	    consumerSecret:process.env.TWITTER_CONSUMER_SECRET,
	    callbackURL:"https://sokoni.innovatenbo.tech/twitter/callback"
	  },
	function(token, tokenSecret, profile, cb) {

	const userProfile=profile;
			console.log(userProfile);
		    const name = userProfile['displayName']
		    const oAuthUserId = userProfile['id']
		    const oAuthProvider = userProfile['provider']
		    const imageUrl = userProfile['photos'][0]['value']

		    const oAuthTwitter = { name, oAuthUserId, oAuthProvider, imageUrl }
		    createOauthTwitter(name, oAuthUserId, oAuthProvider, imageUrl)
		    console.log(oAuthTwitter)


          return cb(null, profile);
    }
));
passport.serializeUser(function(user, cb) {
	            cb(null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
	            cb(null , obj);  // _id is the only thing we need to store in session for now
})

//Facebook authentication
passport.use(new FacebookStrategy({
	    clientID: process.env.FACEBOOK_APP_ID,
	    clientSecret: process.env.FACEBOOK_APP_SECRET,
	    callbackURL: "https://sokoni.innovatenbo.tech/facebook/callback",
	enableProof: true
	  },
	  function(accessToken, refreshToken, profile, cb) {
		const userProfile = profile;
		  console.log(userProfile);
			
		  const name = userProfile['displayName']
                  const oAuthUserId = userProfile['id']
                  const oAuthProvider = userProfile['provider']
                  
                  const oAuthUserFb = { oAuthUserId, name, oAuthProvider }
                  createOauthFb(oAuthUserId, name, oAuthProvider)
                  console.log(oAuthUserFb)

		  return cb(null, profile);
		    }
));
passport.serializeUser(function(user, cb) {
                    cb(null , user);  // _id is the only thing we need to store in session for now
})

passport.deserializeUser(function(user, cb) {
                    cb(null , obj);  // _id is the only thing we need to store in session for now
})

export { passport, TwitterStrategy, FacebookStrategy, GoogleStrategy };

