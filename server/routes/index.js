'use strict';

var authService = require('../controllers/authService')
  , userService = require('../controllers/userService')
  // , projectService = require('../controllers/projectService')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]
  , path = require('path');

/**
 * Boot for application routes
 * @param  {Object} app      The express server application
 * @param  {Object} passport The passport authentication object
 */
module.exports = function(app, passport) {

  // login user from cookie regardless of entry point into app
  app.all('*', authService.loginFromCookie);
  app.get('/api/user/current-user', authService.getCurrentUser);

  /*
   * oAuth providers
   */
  app.get('/auth/facebook', passport.authenticate('facebook',
    { scope: 'email, user_birthday' }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook',
    { failureRedirect: '/login', successRedirect: '/' }));
  app.get('/auth/google', passport.authenticate('google',
    { scope: ['https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'] }));
  app.get('/auth/google/callback', passport.authenticate('google',
    { failureRedirect: '/login', successRedirect: '/' }));

  /*
   * Auth Routes
   */
  app.post('/api/user/register', authService.register);
  app.post('/api/user/activate', authService.activate, authService.loginUser);
  app.post('/api/user/resendActivation', authService.resendActivationLink);
  app.post('/api/user/forgotPassword', authService.sendPasswordLink);
  app.post('/api/user/validatePasswordReset', authService.validatePasswordReset, authService.respondValidated);
  app.post('/api/user/resetPassword',
    authService.validatePasswordReset, authService.changeForgottenPassword,
    authService.loginUser);


  //user login routes
  app.post('/api/user/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if(err) return res.json(400, err);
      if(!user && info) return res.json(412, info);

      req.newUser = user;
      return next();
    })(req, res, next);
  }, authService.loginUser);

  app.post('/api/user/logout', authService.logout);


  /*
   * User routes.
   */
  app.all('/api/account/*', authService.isLoggedIn);
  app.put('/api/account', authService.isLoggedIn, userService.editAccount);
  app.put('/api/account/editPassword', userService.changePassword);
  app.get('/api/account/linkedAccounts', userService.getLinkedAccounts);
  app.delete('/api/account/linkedAccounts/:id', userService.removeLinkedAccount);
  app.get('/api/account/security', userService.getLoginTokens);
  app.delete('/api/account/security/:id', userService.removeLoginToken);
  app.get('/api/account/deactivate', userService.deactivateAccount);

  /*
   * Project routes.
   */
  // app.get('/api/projects', projectService.list);
  // app.get('/api/project/:pid', projectService.show);
  // app.post('/api/projects', projectService.create);
  // app.put('/api/project/:pid', projectService.update);
  // app.delete('/api/project/:pid', projectService.remove);


  // // redirect all others to the index (HTML5 history)
  app.get('*', function(req, res){
    res.sendfile('index.html', { root: config.node.distFolder });
  });

};
