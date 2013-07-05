'use strict';

var User = require('../models/user');
var LoginToken = require('../models/loginToken');
var uuid = require('uuid-v4');
var useragent = require('express-useragent');

var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var errorMessages = require('../config/errorMessages');

var mailerService = require('./mailerService.js');
var logger = require('./loggerService.js').logger;
var routes;

/*
 * Account Routes
 */

/**
 * Edit Account
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     412, with error: Validation Failed
 *                           First name, Last name, Email format
 *                           Gender
 *                      200: User updated.
 */
exports.editAccount = function(req, res) {
  //validate formInput inputs
  req.assert('email', errorMessages.invalidEmail).isEmail();
  req.assert('password', errorMessages.invalidPassword).len(6, 128);
  var errors = req.validationErrors();
  if(errors){
    return res.json(412, errors);
  }
  else {
    req.user.checkPassword(req.body.password, function(err, isMatch){
      if (err) { return res.json(500, err); }
      if(!isMatch) {
        return res.json(412, errorMessages.incorrectPassword);
      }
      else {
        req.user.first = req.body.first;
        req.user.last = req.body.last;
        req.user.email = req.body.email.toLowerCase().trim();
        req.user.gender = req.body.gender;
        req.user.birthday = req.body.birthday;

        req.user.save(function(err){
          if(err) { return res.json(412, err); }
          return res.json(200);
        });
      }
    });
  }
};

/**
 * Get Security Tokens
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     Renders the specified template.
 */
exports.getLoginTokens = function(req, res) {
  LoginToken.getTokens(req.user.email, function(err, cookies){
    if(err) { return res.json(500, err); }
    return res.json(200, cookies);
  });
};

/**
 * Remove Cookie
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     500, with error: Failed to remove cookie from database
 *                      200: Cookie removed.
 */
exports.removeLoginToken = function(req, res) {
  LoginToken.removeToken({autoIndexSeries: req.params.autoIndexSeries, token: req.params.token}, function(err){
    if(err) { return res.json(500, errorMessages.failedToRemoveToken); }
    return res.json(200);
  });
};

/**
 * Change a user password. User is validated by email token or existing password
 * Called from changeForgottenPassword as well as from account page
 * @param  {object}   req   Request.
 * @param  {object}   res   Response.
 * @param  {function} next  Middleware.
 * @return {JSON}           412, with error: Validation failed
 *                               Existing password is incorrect
 *                               New password does not meet policy
 *                               New Password and confirmation do not match
 *                          500, with error: Failed to save user in database
 *                          200: Password Changed.
 */
exports.changePassword = function(req, res, next) {

  // validate inputs
  req.assert('newPassword', errorMessages.invalidPassword).len(6, 128);
  req.assert('passwordConfirm', errorMessages.invalidPassword).len(6, 128);
  var errors = req.validationErrors();
  if(errors){
    return res.json(412, errors);
  }
  // validate that the passwords match
  if (req.body.newPassword !== req.body.passwordConfirm) {
    return res.json(412, errorMessages.passwordsDoNotMatch);
  }
  else {
    req.user.checkPassword(req.body.currentPassword, function(err, isMatch){
      if (err) { return res.json(500, err); }
      if(!isMatch) {
        return res.json(412, errorMessages.incorrectPassword);
      }
      else {
        req.user.password = req.body.newPassword;
        req.user.save(function(err){
          if (err) { return res.json(500, err); }
          return res.json(200);
        });
      }
    });
  }
};

/**
 * Deactivate Account
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     500, with error: Failed to update user in database
 *                      200: Account deactivated.
 */
exports.deactivateAccount = function(req, res) {
  var updates = {
    active: false,
    accountDeactivated: true
  };

  req.user.update(updates, function (err, user) {
    if (err) { return res.json(500, errorMessages.failedToSave); }
    return res.json(200, user);
  });
};


