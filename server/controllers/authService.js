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
  , mailerService = require('./mailerService')
  // , logger = require('./loggerService.js').logger;
  , routes;

var filterUser = function(user) {
  if ( user ) {
    return {
      user : {
        id: user.id,
        email: user.email,
        first: user.first,
        last: user.last,
        gender: user.gender,
        birthday: user.birthday,
        hasPassword: user.hashed_password ? true: false
      }
    };
  } else {
    return { user: null };
  }
};

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
    return res.json(401, errorMessage.loginRequired);
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
  res.json(200, filterUser(req.user));
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
    // req.session.error = errors[0].msg;
    // return res.redirect(routes.home.url);
    return res.json(412, errors);
  }
  else {
    User.getIndexedNode('node_auto_index', 'activationKey',
      req.body.activationKey, function(err, user) {
      // validate if a user exists for the selected key
      if (err || !user) {
        // req.session.error = errorMessages.invalidActivationKey;
        return res.json(412, errorMessages.invalidActivationKey);
        // return res.redirect(routes.home.url);
      }
      // validate if the key has already been used
      else if (user.activationKeyUsed) {
        // req.session.error = errorMessages.usedActivationKey;
        return res.json(412, errorMessages.usedActivationKey);
        // return res.redirect(routes.home.url);
        // return res.redirect(urls.login);
      }
      // activate the user if the validations pass
      else {
        var updates = {
          active: true,
          activationKeyUsed: true,
          accountDeactivated: false
        };

        user.update(updates, function(err) {
          if(err) {
            req.session.error = errorMessage.failedToSave;
            return res.json(412, errorMessages.failedToSave);
            // return res.redirect(routes.home.url);
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
  User.findByEmail(email, function(err, user) {
    if (err || !user) {
      return callback(err, null);
    }
    //check if user is locked
    else if (user.isLocked) {
      // just increment login attempts if account is already locked
      user.incLoginAttempts(function(err) {
        // if (err) { return callback(err, null, null); }
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
            // if (err) { return callback(err, null); }
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
          var relationship = {
            email: req.body.email.toLowerCase(),
            type: 'AUTHORISES',
            direction: 'from'
          };
          loginToken.save(relationship, function(err, response){
            if(err) return next(err);
            res.cookie('logintoken', response.node.getCookieValue(),
              { maxAge: 2 * 604800000, signed: true, httpOnly: true });
            res.json(200, filterUser(newUser));
          });
        });
    }
    else {
      res.json(200, filterUser(newUser));
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
    LoginToken.getToken(cookieInfo, function(err, user, token){
      if(!token){
        LoginToken.removeTokenSeries(cookie.autoIndexSeries, function(err) {
          // TODO: this means cookie has been compromised - warning?
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
          token.ip = req.ip;
          token.browser = agent.Browser;
          token.os = agent.OS;
          token.userAgent = JSON.stringify(agent);
          token.save(function(){
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
    // req.session.error = errors[0];
    return res.json(412, errors);
    // return res.redirect(routes.home.url);
  }
  else {
    // find the corresponding user for the password reset key and id
    User.findPassReset(req.body.user_id, req.body.passwordResetKey,
      function(err, user) {
      //fail validation if user cannot be found
      if (err || !user) {
        // req.session.error = errorMessages.invalidPasswordKey;
        return res.json(412, errorMessages.invalidPasswordKey);
        // return res.redirect(routes.home.url);
      }
      // fail validation if key is already used
      else if (user.passwordResetUsed) {
        // req.session.error = errorMessages.usedPasswordKey;
        return res.json(412, errorMessages.usedPasswordKey);
        // return res.redirect(routes.home.url);
      }
      else {
        // var expiryTimeout = 1; testing
        var expiryTimeout = 1000 * 60 * 60 * 2; //2 hours expiry
        var currentDate = new Date();

        // fail validation if the key has timed out
        if (user.passwordResetDate < currentDate - expiryTimeout) {
          // req.session.error = errorMessages.expiredPasswordKey;
          return res.json(412, errorMessages.expiredPasswordKey);
          // return res.redirect(routes.forgotPassword.url);
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
    User.findByEmail(req.body.email, function(err, user){
      if(user && user.active){
        return res.json(412,  errorMessages.userRegisteredAndActive );
      }
      if(user && !user.active){
        return res.json(412,  errorMessages.userRegisteredNotActive );
      }
      else {
        // var month = parseInt(req.body.birthday_dateLists_month_list)+1;
        var user = new User({
          first: req.body.first,
          last: req.body.last,
          email: req.body.email,
          gender: req.body.gender,
          password: req.body.password,
          birthday: req.body.birthday,
          activationKey: uuid()
        });

        user.save(function(err, user){
          if(err) {
            // req.session.formData = req.body;
            // req.session.error = err;
            // return res.redirect(routes.home.url);
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
              activationLink: 'http://' + req.headers.host + '/activate/' +
                user.activationKey
            };

            mailerService.sendMail(options, data, function(err, response) {
              // TODO: what should happen if this email fails???
              // should already be logged by mailerService
            });
            // do not wait for mail callback to proceed. Can take a few seconds
            // return res.render(routes.registerSuccess.template,
            //   { title: routes.registerSuccess.title });
            return res.json(200);
          }
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
  OAuthProvider.find(provider, profile._json.id, function(err, user) {
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
      oAuthProvider.nodeType = 'OAuthProvider';
      // oAuthProvider.id = parseInt(oAuthProvider.id);

      // rename facebook and google variables
      // TODO: If you add more porviders update these
      oAuthProvider.profileId = oAuthProvider.id;
      delete oAuthProvider.id;
      oAuthProvider.first = oAuthProvider.first_name || oAuthProvider.given_name;
      delete oAuthProvider.first_name;
      delete oAuthProvider.given_name;
      oAuthProvider.last = oAuthProvider.last_name || oAuthProvider.family_name;
      delete oAuthProvider.last_name;
      delete oAuthProvider.family_name;

      // map the pure json to a model
      oAuthProvider = new OAuthProvider(oAuthProvider);

      // validate if email already exists
      User.findByEmail(oAuthProvider.email, function(err, user) {
        var rel = {
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
          newUser.save(function(err, user){
            rel.id = user.id;
            if(err) return callback(err);
            oAuthProvider.save(rel, function(err, oAuthProvider){
              if(err) return callback(err);
              user.emit('activated');
              return callback(null, user);
            });
          });
        }
        else {
          if(!user.id) user = user[0];
          rel.id = user.id;

          if (!user.birthday || (typeof user.birthday !== "number" && user.birthday.slice(0,4) === '0000')) {
            user.birthday = birthday;
          }
          if (!user.active) { user.active = true; }
          user.accountDeactivated = false;

          oAuthProvider.save(rel, function(err, oAuthProvider){
            user.save(function(err, user){
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
  User.findByEmail(req.body.email, function(err, user) {
    if(err || !user){
      // req.session.error = errorMessages.invalidEmail;
      return res.json(412, errorMessages.userNotRegistered);
      // return res.redirect(routes.resendActivation.url);
    }
    if (user.active) {
      // req.session.error = errorMessages.userRegisteredAndActive;
      return res.json(412, errorMessages.userRegisteredAndActive);
      // return res.redirect(routes.resendActivation.url);
    }
    else {
      // if the user has been de-activated but wants to re-activate
      // a new token needs to be generated
      if (user.accountDeactivated) {
        user.activationKeyUsed = false;
        user.activationKey = uuid();
        user.save();
      }
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
        activationLink: 'http://' + req.headers.host + '/activate/' +
          user.activationKey
      };

      mailerService.sendMail(options, data, function(err, response) {
        //TODO: what should happen if this email fails???
      });
      // return res.render(routes.activationResent.template,
      //         { title: routes.activationResent.title });
      return res.json(200)
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
  User.findByEmail(req.body.email, function(err, user) {
    // fail if user cannot be found
    if (err || !user) {
      // req.session.error = errorMessages.invalidEmail;
      // return res.redirect(routes.sendPasswordLink.url,
      //         { title: routes.sendPasswordLink.title });
      return res.json(412, errorMessages.userNotRegistered);
    }
    else {
      //create a new password reset key
      user.passwordResetKey = uuid();
      user.passwordResetDate = new Date();
      user.passwordResetUsed = false;

      //save the key
      user.save(function(err) {
        if (err) {
          return res.json(500, errorMessages.failedToSave);
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
            activationLink: 'http://' + req.headers.host + '/resetPassword/' + user.id + '/' +
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
          // return res.render(routes.passwordLinkSent.template,
          //     { title: routes.passwordLinkSent.title });
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

  user.password = req.body.password;
  user.passwordResetUsed = true;
  user.save(function(err){
    if (err) {
      return res.json(500, err);
    }
    else {
      req.newUser = user;
      return next();
    }
  });
};

/**
 * Get linked social accounts
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       500. Error occured.
 *                      200. List of providers.
 */
exports.getLinkedAccounts = function(req, res) {
  OAuthProvider.getAccounts(req.user.id, function (err, providers){
    if(err) return res.json(500, err);
    return res.json(200, providers);
  });
};

/**
 * Remove a linked social account
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       500. Error occured.
 *                      200. Account removed.
 */
exports.removeLinkedAccount = function(req, res) {
  OAuthProvider.removeAccount(req.params.id, function (err){
    if(err) return res.json(500, err);
    return res.json(200);
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
    LoginToken.removeToken(
      { autoIndexSeries: cookie.autoIndexSeries, token: cookie.token }
      , function(err) {
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
