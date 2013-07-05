var Errors = require('../lib/errors');

module.exports = {
  // Database errors
  failedToLogin:              new Errors.DatabaseError(20370, 'Failed to login user'),
  failedToSave:               new Errors.DatabaseError(10510, 'Failed to save user'),
  failedToRemoveToken:        new Errors.DatabaseError(10510, 'Failed to remove cookie'),


  // account validation
  invalidFirstName:           new Errors.ApiError(20010, 'First Name is required'),
  invalidLastName:            new Errors.ApiError(20020, 'Last Name is required'),
  invalidEmail:               new Errors.ApiError(20030, 'Valid email required'),
  invalidEmailDisposable:     new Errors.ApiError(20040, 'We are a community here. Please do not use disposable email addresses'),
  invalidPassword:            new Errors.ApiError(20050, 'Password is required and must be between 6 and 128 characters'),
  invalidGender:              new Errors.ApiError(20060, 'Gender is required'),
  // invalidTerms:               new Errors.ApiError(20080, 'Please confirm that you agree to the Terms and Conditions'),

  //registration
  userRegisteredAndActive:    new Errors.ApiError(20150, 'The email address entered is already active.'),
  userRegisteredNotActive:    new Errors.ApiError(20160, 'The email address entered is already registered.'),
  invalidActivationKey:       new Errors.ApiError(20170, 'Thats not a valid activation link!'),
  usedActivationKey:          new Errors.ApiError(20180, 'Your activation link has already been used. Please Login'),

  // Login
  userNotActive:              new Errors.ApiError(20300, 'The email address entered is not active.'),
  userNotRegistered:          new Errors.ApiError(20310, 'The email address entered is not registered. Please Sign Up'),
  incorrectPassword:          new Errors.ApiError(20320, 'The password entered is incorrect.'),
  accountSuspended:           new Errors.ApiError(20330, 'Your account has been locked due to too many incorrect login attempts. Please try again in 5 minutes'),
  userDeactivated:            new Errors.ApiError(20340, 'The email address entered is associated with a deactivated account.'),

  // Forgot Password
  invalidPasswordKey:         new Errors.ApiError(20500, 'Cannot find user for selected password reset link. Click on the link in your email again or request a new one below'),
  usedPasswordKey:            new Errors.ApiError(20510, 'Your password reset link has already been used. Please request a new one below'),
  expiredPasswordKey:         new Errors.ApiError(20520, 'Your password reset link has expired.'),
  passwordsDoNotMatch:        new Errors.ApiError(20530, 'The passwords that you entered do not match. Please try again'),

  //loginTokens
  tokenError:                 new Errors.ApiError(20610, 'Error retrieving other logins. Please try again'),

  // linked accounts
  oAuthProviderError:         new Errors.ApiError(20620, 'Error retrieving linked accounts. Please try again'),

  // generic
  loginRequired:              new Errors.ApiError(20360, 'You must be logged in to access this part of the application.')

};