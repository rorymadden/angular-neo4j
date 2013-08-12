'use strict';

var LoginToken = require('../models/loginToken')
  , OAuthProvider = require('../models/oAuthProvider')
  , errorMessages = require('../config/errorMessages');

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
      if (err) { return res.json(400, err); }
      if(!isMatch) {
        return res.json(412, errorMessages.incorrectPassword);
      }
      else {
        var updates = {
          first: req.body.first,
          last: req.body.last,
          email: req.body.email.toLowerCase().trim(),
          gender: req.body.gender,
          birthday: req.body.birthday
        };

        req.user.update(updates, function(err){
          if(err) { return res.json(412, err); }
          return res.json(200);
        });
      }
    });
  }
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
 *                          200: Password Changed.
 */
exports.changePassword = function(req, res) {

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
      if (err) { return res.json(400, err); }
      if(!isMatch) {
        return res.json(412, errorMessages.incorrectPassword);
      }
      else {
        req.user.createHash(req.body.newPassword, function(err, hash){
          if(err) return res.json(400, err);
          var updates = {
            hashed_password: hash
          };
          req.user.update(updates, function(err, user){
            if (err) { return res.json(400, err); }
            return res.json(200);
          });
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
  // LoginToken.getTokens(req.user.email, function(err, cookies){
  req.user.getIncomingRelationships('AUTHORISES', function(err, cookies){
    if(err) { return res.json(400, err); }
    return res.json(200, cookies.nodes);
  });
};

/**
 * Remove Cookie
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     400, with error: Failed to remove cookie from database
 *                      200: Cookie removed.
 */
exports.removeLoginToken = function(req, res) {
  // could use findOneAndRemove but this query is more efficient
  LoginToken.findByIdAndRemove(req.params.id, {remove: {force: true }}, function(err){
    if(err) { return res.json(412, errorMessages.failedToRemoveToken); }
    return res.json(200);
  });
};

/**
 * Get linked social accounts
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       400. Error occured.
 *                      200. List of providers.
 */
exports.getLinkedAccounts = function(req, res) {
  // OAuthProvider.getAccounts(req.user.id, function (err, providers){
  req.user.getIncomingRelationships('OAUTHORISES', function(err, providers){
    if(err) return res.json(400, err);
    return res.json(200, providers.nodes);
  });
};

/**
 * Remove a linked social account
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {JSON}       400. Error occured.
 *                      200. Account removed.
 */
exports.removeLinkedAccount = function(req, res) {
  OAuthProvider.findByIdAndRemove(req.params.id, {remove: {force: true }}, function (err){
    if(err) return res.json(412, err);
    return res.json(200);
  });
};

/**
 * Deactivate Account
 * @param  {object} req Request.
 * @param  {object} res Response.
 * @return {render}     400, with error: Failed to update user in database
 *                      200: Account deactivated.
 */
exports.deactivateAccount = function(req, res) {
  var updates = {
    active: false,
    accountDeactivated: true
  };

  req.user.update(updates, function (err, user) {
    if (err) { return res.json(400, err); }
    return res.json(200, user);
  });
};


