
var LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

  // models
  , User = require('../models/user')

  // controllers
  , authService = require('../controllers/authService');

/**
 * Boot the passport settings into the server
 * @param  {object} passport Passport object.
 * @param  {object} config   Config object.
 */
exports.boot = function (passport, config){
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user){
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      authService.authenticate(email, password, function(err, user, info) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, info); }
        return done(null, user, info);
      });
    }
  ));

  // use facebook strategy
  passport.use(new FacebookStrategy({
        clientID: config.facebook.appId
      , clientSecret: config.facebook.appSecret
      , callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      authService.loginOrCreate('facebook', profile, done);
    }
  ));

  // use google strategy
  passport.use(new GoogleStrategy({
        clientID: config.google.clientID
      , clientSecret: config.google.clientSecret
      , callbackURL: config.google.callbackURL
      , passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      authService.loginOrCreate('google', profile, done);
    }
  ));
};
