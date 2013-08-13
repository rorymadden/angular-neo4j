'use strict';

var useragent = require('express-useragent')
  , uuid = require('uuid-v4')
  , request = require('superagent')

    // models
  , User = require('../models/user')
  , LoginToken = require('../models/loginToken')
  , OAuthProvider = require('../models/oAuthProvider')

    // helpers

  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]
  , errorMessages = require('../config/errorMessages')
  , mailerService = require('./mailerService');
  // , logger = require('./loggerService.js').logger;


/**
 * Middelware to validate whether the user is logged is
 * @param  {object}   req  Request.
 * @param  {object}   res  Response.
 * @param  {function} next next middleware.
 * @return {mixed}         Success: Fall through
 *                         Error: Redirect to login page.
 */
exports.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    return res.json(401, errorMessages.loginRequired);
  }
};

/**
 * Middelware to validate whether the user is anonymous
 * @param  {object}   req  Request.
 * @param  {object}   res  Response.
 * @param  {function} next next middleware.
 * @return {mixed}         Success: Fall through
 *                         Error: Redirect to home page.
 */
// exports.isAnonymous = function(req, res, next) {
//   if (!req.isAuthenticated()) {
//     return next();
//   }
//   else {
//     return next(new Error('Already logged in'));
//     // return res.redirect(routes.home.url);
//   }
// };

exports.getCurrentUser = function(req, res){
  // res.json(200, filterUser(req.user));
  res.json(200, req.user);
};

/**
 * Routing middleware to call the user activation service
 * Receives error or activated user
 * @param  {object}   req  Request.
 * @param  {object}   res  Response.
 * @param  {object}   next Middleware chain.
 * @return {mixed}         Error: Redirects to Login Screen - User active
 *                         Error: Redirects to resend activation - user inactive
 *                         Success: Falls through to enable autologin.
 */

exports.activate = function(req, res, next) {
  req.assert('activationKey', errorMessages.invalidActivationKey).isUUID(4);
  var errors = req.validationErrors();
  if(errors){
    return res.json(412, errors);
  }
  else {
    // User.getIndexedNode('node_auto_index', 'activationKey', req.body.activationKey, function(err, user) {
    User.findOne({activationKey: req.body.activationKey}, function(err, user){
      // validate if a user exists for the selected key
      if (err || !user) {
        return res.json(412, errorMessages.invalidActivationKey);
      }
      // validate if the key has already been used
      else if (user.activationKeyUsed) {
        return res.json(412, errorMessages.usedActivationKey);
      }
      // activate the user if the validations pass
      else {
        var updates = {
          active: true,
          activationKeyUsed: true,
          accountDeactivated: false
        };
        var options = {
          eventNodes : {
            node:false,
            user:false
          }
        };

        user.update(updates, null, options, function(err) {
          if(err) {
            return res.json(412, errorMessages.failedToSave);
          }
          user.emit('activated');
          req.newUser = user;
          return next();
        });
      }
    });
  }
};

/**
 * Authenticate user on login
 * Validate if they are locked (too many bad attempts)
 * Validate if they are active (not yet activated) or deactivated
 * Validate that the passwords match
 * @param  {String}   email    Email of user being authenticated.
 * @param  {String}   password Password for user - plain text.
 * @param  {Function} callback System Error, User, Validation Error.
 * @return {Function} callback Callback.
 */
exports.authenticate = function(email, password, callback) {
  User.findOne({email: email.toLowerCase()}, function(err, user) {
    if (err || !user) {
      return callback(err, null);
    }
    //check if user is locked
    else if (user.isLocked) {
      // just increment login attempts if account is already locked
      user.incLoginAttempts(function(err) {
        return callback(err, null, errorMessages.accountSuspended);
      });
    }
    //if the user is not active check if de-activated
    else if (!user.active) {
      if (user.accountDeactivated) {
        return callback(null, null, errorMessages.userDeactivated);
      }
      else {
        return callback(null, null, errorMessages.userNotActive);
      }
    }
    else {
      user.checkPassword(password, function(err, isPasswordMatch) {
        if (!isPasswordMatch) {
          // password is incorrect, increment login attempts before responding
          user.incLoginAttempts(function(err) {
            return callback(err, null, errorMessages.incorrectPassword);
          });
        }
        // if there's no lock or failed attempts, just return the user
        else if (!user.loginAttempts && !user.lockUntil) {
          return callback(null, user);
        }
        // if there were previous attempts, reset attempts and lock info
        else {
          var updates = {
            loginAttempts: 0,
            lockUntil: null
          };
          user.update(updates, function(err) {
            if (err) { return callback(err, null); }
            return callback(null, user);
          });
        }
      });
    }
  });
};

/**
 * Routing middleware to automatically login a user
 * Will create cookie if user has "remember me" selected
 * @param  {object}   req  Request.
 * @param  {object}   res  Response.
 * @param  {object}   next Middleware chain.
 * @return {JSON}          500, with error: Failed to login
 *                         200: User logged in.
 */
exports.loginUser = function(req, res, next) {
  // pick up validated user
  var newUser = req.newUser;
  req.newUser = null;

  req.login(newUser, function(err) {
    if (err) {
      return next(errorMessages.failedToLogin);
    }
    else if (req.body.remember_me) {
      var agent = {};
      request
        .get('http://freegeoip.net/json/' + req.ip)
        .end(function(response){
          if(req.headers['user-agent']){
            agent = useragent.parse(req.headers['user-agent']);
          }
          var loginToken = new LoginToken({
            ip: req.ip,
            country: response.country || 'Not found',
            city: response.city || 'Not found',
            browser: agent.Browser || 'Not found',
            os: agent.OS || 'Not found',
            userAgent: JSON.stringify(agent),
            autoIndexSeries: uuid()
          });
          var options = {
            relationship: {
              nodeLabel: 'User',
              indexField: 'email',
              indexValue: req.body.email.toLowerCase(),
              type: 'AUTHORISES',
              direction: 'from'
            },
            eventNodes: {
              user:false,
              node: false
            }
          };
          loginToken.create(options, function(err, response){
            if(err) return next(err);
            res.cookie('logintoken', response.node.getCookieValue(),
              { maxAge: 2 * 604800000, signed: true, httpOnly: true });
            // res.json(200, filterUser(newUser));
            res.json(200, newUser);
          });
        });
    }
    else {
      // res.json(200, filterUser(newUser));
      res.json(200, newUser);
    }
  });
};

/**
 * Routing middleware to automatically login a user from a cookie
 * @param  {object}   req  Request.
 * @param  {object}   res  Response.
 * @param  {object}   next Middleware chain.
 * @return {mixed}         Error: Falls through
 *                         Success: Logins in User and falls through.
 */
exports.loginFromCookie = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // login request with cookie
  else if (req.signedCookies.logintoken) {
    var cookie = JSON.parse(req.signedCookies.logintoken);
    var cookieInfo = {
      autoIndexSeries: cookie.autoIndexSeries,
      token: cookie.token
    };
    // LoginToken.getToken(cookieInfo, function(err, user, token){
    LoginToken.findOne(cookieInfo, function(err, user, token){
      if(!token){
        // TODO: this means cookie has been compromised - warning?
        LoginToken.removeTokenSeries(cookie.autoIndexSeries, function(err) {
          res.clearCookie('logintoken');
          return next();
        });
      }
      else if (!user) { return next(); }
      else{
        //Login User
        req.login(user, function(err) {
          var agent = useragent.parse(req.headers['user-agent']);
          //Update Token
          var updates = {
            ip: req.ip,
            browser: agent.Browser,
            os: agent.OS,
            useragent: JSON.stringify(agent)
          };
          token.update(updates, null, {eventNodes: { node: false, user:false }}, function(){
            res.cookie('logintoken', token.cookieValue,
              { maxAge: 2 * 604800000, signed: true, httpOnly: true });
              return next();
          });
        });
      }
    });
  }
  else { return next(); }
};

/**
 * Validate Password Reset Route Middleware
 * Calls the user validatePasswordReset service
 * @param  {object}   req   Request.
 * @param  {object}   res   Response.
 * @param  {function} next  Middleware.
 * @return {render}         Error: Redirects to home / forgot password
 *                          Success: Falls through.
 */
exports.validatePasswordReset = function(req, res, next) {
  // check that the password reset token and user id are in the correct format
  req.assert('passwordResetKey', errorMessages.invalidPasswordKey).isUUID(4);
  req.assert('user_id', errorMessages.invalidPasswordKey).isAlphanumeric();
  var errors = req.validationErrors();
  if(errors){
    return res.json(412, errors);
  }
  else {
    // find the corresponding user for the password reset key and id
    // User.findPassReset(req.body.user_id, req.body.passwordResetKey,
    User.findOne({_id: req.body.user_id, passwordResetKey: req.body.passwordResetKey},
      function(err, user) {
      //fail validation if user cannot be found
      if (err || !user) {
        return res.json(412, errorMessages.invalidPasswordKey);
      }
      // fail validation if key is already used
      else if (user.passwordResetUsed) {
        return res.json(412, errorMessages.usedPasswordKey);
      }
      else {
        // var expiryTimeout = 1; testing
        var expiryTimeout = 1000 * 60 * 60 * 2; //2 hours expiry
        var currentDate = new Date();

        // fail validation if the key has timed out
        if (user.passwordResetDate < currentDate - expiryTimeout) {
          return res.json(412, errorMessages.expiredPasswordKey);
        }
        // pass validation
        else {
          req.userPass = user;
          return next();
        }
      }
    });
  }
};
/**
 * Respond 200 if reached. If there is an erorr previous middleware will fail
 * @param  {object}   req
 * @param  {object}   res
 * @param  {Function} next
 * @return {json}        200 always
 */
exports.respondValidated = function(req, res) {
  return res.json(200);
};

/**
 * Register a new User
 * Returns a JSON reponse
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       412, with error: Validation failed
 *                           First name, last name, gender, Email format,
 *                           Password policy, Agree to Terms,
 *                           User already registered
 *                      200: User registered
 */
exports.register = function(req, res) {
  // validate that terms and conditions have been met
  req.assert('first', errorMessages.invalidFirstName).notEmpty();
  req.assert('last', errorMessages.invalidLastName).notEmpty();
  req.assert('email', errorMessages.invalidEmail).isEmail();
  req.assert('password', errorMessages.invalidPassword).len(6, 128);
  req.assert('gender', errorMessages.invalidGender).notEmpty();
  var errors = req.validationErrors();
  if(errors){
    return res.json(412,  errors );
  }
  else {
    User.findOne({email: req.body.email.toLowerCase()}, function(err, user){
      if(user && user.active){
        return res.json(412,  errorMessages.userRegisteredAndActive );
      }
      else if(user && !user.active){
        return res.json(412,  errorMessages.userRegisteredNotActive );
      }
      else {
        var user = new User({
          first: req.body.first,
          last: req.body.last,
          email: req.body.email,
          gender: req.body.gender,
          // birthday: req.body.birthday,
          activationKey: uuid()
        });

        user.createHash(req.body.password, function(err, hash){
          user.hashed_password = hash;
          if(err) res.json(400, err);
          user.create(function(err, user){
            if(err) {
              return res.json(412,  err );
            }
            else {
              // email user
              var options = {
                template: 'invite',
                from: config.appName + ' <' + config.email.registration + '>',
                subject: 'Thank you for registering for ' + config.appName
              };

              var data = {
                email: user.email,
                name: user.first,
                appName: config.appName,
                activationLink: 'http://' + req.headers.host + '/register/' +
                  user.activationKey
              };

              mailerService.sendMail(options, data, function(err, response) {
                // TODO: what should happen if this email fails???
                // should already be logged by mailerService
              });
              // do not wait for mail callback to proceed. Can take a few seconds
              return res.json(200, user);
            }
          });
        });
      }
    });
  }
};

/**
 * Called from Social Media logins (Facebook, Google, etc)
 * Logs user in if Oauth2 profile already linked to a user
 * Logs user in and associates Oauth2 provider if email already linked to a user
 * Creates new auth if above conditions are not found
 * @param  {String}   provider Name of Oauth2 provider - facebook, google.
 * @param  {Object}   profile  Profile returned from Oauth2 supplier.
 * @param  {Function} callback Error, user.
 */
exports.loginOrCreate = function(provider, profile, callback){
  //find by oauth2 provider
  // OAuthProvider.find(provider, profile._json.id, function(err, user) {
  OAuthProvider.findOne({id: profile._json.id, provider: provider}, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user || !user.active) {

      var birthday = profile._json.birthday;
      //convert facebook date YYYY-MM-DD
      var dateElements = profile._json.birthday.split('/');
      if(dateElements[1]) {
        birthday = dateElements[2] + "-" + dateElements[0] + "-" +
        dateElements[1];
      }

      // manipulate the json returned into the required format
      var oAuthProvider = profile._json;
      oAuthProvider.provider = provider;
      oAuthProvider._nodeType = 'OAuthProvider';
      oAuthProvider.birthday = birthday;
      // oAuthProvider.id = parseInt(oAuthProvider.id);

      // rename facebook and google variables
      // TODO: If you add more providers update these
      // oAuthProvider.profileId = oAuthProvider.id;
      // delete oAuthProvider.id;
      oAuthProvider.first = oAuthProvider.first_name || oAuthProvider.given_name || oAuthProvider.first;
      delete oAuthProvider.first_name;
      delete oAuthProvider.given_name;
      oAuthProvider.last = oAuthProvider.last_name || oAuthProvider.family_name || oAuthProvider.last;
      delete oAuthProvider.last_name;
      delete oAuthProvider.family_name;

      // map the pure json to a model
      oAuthProvider = new OAuthProvider(oAuthProvider);

      // validate if email already exists
      User.findOne({email: oAuthProvider.email }, function(err, user) {
        var rel = {
          nodeLabel: 'User',
          indexField: '_id',
          direction: 'from',
          type: 'OAUTHORISES'
        };
        if (err || !user) {

          //create a new user
          user = {
            first: oAuthProvider.first,
            last: oAuthProvider.last,
            email: oAuthProvider.email,
            gender: oAuthProvider.gender,
            birthday: birthday
          };
          var newUser = new User(user);
          newUser.create(function(err, user){
            if(err) return callback(err);
            // populate the missing relationship fields
            rel.indexValue = user._id;

            var options = {
              relationship: rel,
              eventNodes: {
                user:false,
                node: false
              }
            };

            oAuthProvider.create(options, function(err, oAuthProvider){
              if(err) return callback(err);
              user.emit('activated', oAuthProvider);
              return callback(null, user);
            });
          });
        }
        else {
          if(!user._id) user = user[0];
          // populate the missing relationship fields
          rel.indexValue = user._id;

          var updates = {};
          if (!user.birthday || (typeof user.birthday !== "number" && user.birthday.slice(0,4) === '0000')) {
            updates.birthday = birthday;
          }
          if (!user.active) { updates.active = true; }
          updates.accountDeactivated = false;

          var options = {
            relationship: rel,
            eventNodes: {
              user:false,
              node: false
            }
          };

          oAuthProvider.create(options, function(err, oAuthProvider){
            delete options.relationship;
            user.update(updates, null, options, function(err, user){
              if(err) return callback(err);
              return callback(null, user);
            });
          });
        }
      });
    }
    else {
      return callback(null, user);
    }
  });
};

/**
 * Resend an activation link if requested by a user
 * Validate if user is already active
 * Validate if user is de-activated - generate a new activation token
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       412, with error: Failed Validation
 *                           Invalid Email, User already active
 *                      200: Activation link resent.
 */
exports.resendActivationLink = function(req, res) {
  User.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if(err || !user){
      return res.json(412, errorMessages.userNotRegistered);
    }
    if (user.active) {
      return res.json(412, errorMessages.userRegisteredAndActive);
    }
    else {
      //send email to the user
      var options = {
        template: 'invite',
        from: config.appName + ' <' + config.email.registration + '>',
        subject: 'Activation Key for ' + config.appName
      };

      var data = {
        email: user.email,
        name: user.first,
        appName: config.appName,
        activationLink: 'http://' + req.headers.host + '/register/' +
          user.activationKey
      };

      mailerService.sendMail(options, data, function(err, response) {
        //TODO: what should happen if this email fails???
      });
      // if the user has been de-activated but wants to re-activate
      // a new token needs to be generated
      if (user.accountDeactivated) {
        var updates ={};
        updates.activationKeyUsed = false;
        updates.activationKey = uuid();
        user.update(updates, function(err){
          if(err) return res.json(412, err);
          else return res.json(200);
        });
      }
      else {
        return res.json(200);
      }
    }
  });
};



/**
 * Email password link to requested email address
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       412, with error: Validation failed
 *                           Invalid Email
 *                      500, with error: Database save failed
 *                      200: Password link sent.
 */
exports.sendPasswordLink = function(req,res) {
  User.findOne({email: req.body.email.toLowerCase()}, function(err, user) {
    if (err) {
      return res.json(400, err);
    }
    // respond with 200 even if the user is not known.
    // This is to prevent email fishing on the server
    else if (!user) {
      // mail service requires options for the email
      var options = {
        template: 'unknown_user',
        from: config.appName + ' <' + config.email.registration + '>',
        subject: 'Password reset link for ' + config.appName
      };

      //mail service requires data that can be used in the email template
      var data = {
        email: req.body.email.toLowerCase(),
        appName: config.appName,
        registerLink: 'http://' + req.headers.host + '/register'
      };

      // email the user
      mailerService.sendMail(options, data, function(err, response) {
        //TODO: what should happen if this email fails???
      });
      // dont wait for the mailService to return before responding
      return res.json(200);
    }
    else {
      var updates = {
        passwordResetKey: uuid(),
        passwordResetDate: new Date(),
        passwordResetUsed: false
      };
      //create a new password reset key

      //save the key
      user.update(updates, function(err) {
        if (err) {
          return res.json(400, errorMessages.failedToSave);
        }
        else {
          // mail service requires options for the email
          var options = {
            template: 'password_reset',
            from: config.appName + ' <' + config.email.registration + '>',
            subject: 'Password reset link for ' + config.appName
          };

          //mail service requires data that can be used in the email template
          var data = {
            email: user.email,
            name: user.first,
            appName: config.appName,
            activationLink: 'http://' + req.headers.host + '/register/resetPassword/' + user._id + '/' +
              user.passwordResetKey
          };

          // email the user
          mailerService.sendMail(options, data, function(err, response) {
            //TODO: what should happen if this email fails???
            // if (err) {
            //   logger.error('resend passwordReset mail failed with ' + err);
            //   // throw new Error(err);
            // }
          });
          // dont wait for the mailService to return before responding
          return res.json(200);
        }
      });
    }
  });
};

/**
 * Change password for user from the forgotten password link
 * Link is to be validated before calling this service
 * @param  {object}   req   Request.
 * @param  {object}   res   Response.
 * @param  {function} next  Middleware.
 * @return {JSON}           412, with error: Validation failed
 *                               New password does not meet policy
 *                               New Password and confirmation do not match
 *                          500, with error: Failed to save user in database
 *                          Success: Falls through to enable autologin.
 */
exports.changeForgottenPassword = function(req, res, next) {

  req.assert('password', errorMessages.invalidPassword).len(6, 128);
  req.assert('passwordConfirm', errorMessages.invalidPassword).len(6, 128);
  var errors = req.validationErrors();
  if(errors){
    return res.json(412, errors);
  }
  // validate that the fields match
  if (req.body.password !== req.body.passwordConfirm) {
    return res.json(412, errorMessages.passwordsDoNotMatch);
  }
  // pick up the user from the validation
  var user = req.userPass;
  req.userPass = null;

  user.createHash(req.body.password, function(err, hash){
    if(err) return res.json(400, err);
    var updates = {
      hashed_password: hash,
      passwordResetUsed: true
    };
    user.update(updates, function(err){
      if (err) {
        return res.json(400, err);
      }
      else {
        req.newUser = user;
        return next();
      }
    });
  });

};

/**
 * Logout a user
 * Deletes the cookie and removes the entry in the loginToken database if exist
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       200: User logged out.
 */
exports.logout = function(req, res) {
  req.logOut();
  if (req.signedCookies.logintoken) {
    var cookie = JSON.parse(req.signedCookies.logintoken);
    LoginToken.findOneAndRemove(
      { autoIndexSeries: cookie.autoIndexSeries, token: cookie.token }
      , {remove: {force: true}}, function(err) {
      // need to remove the token
      res.clearCookie('logintoken');
      return res.json(204);
    });
  }
  // return res.redirect(routes.home.url);
  else{
    return res.json(204);
  }
};
