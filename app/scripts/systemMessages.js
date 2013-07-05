angular.module('system.messages', [])

.constant('I18N.MESSAGES', {
  // Generic Messages
  // 10010: 'Successfully saved',
  // 10020: 'Successfully updated',
  // 10030: 'Successfully removed',
  // 10510: 'An unexpected error occured. We\'ll look into that',
  // 10520: 'Route change error. Now that\'s embarrasing!',

  // // Common - Registration
  // 20010: 'First Name is required',
  // 20020: 'Last Name is required',
  // 20030: 'Valid email required',
  // 20040: 'We are a community here. Please do not use disposable email addresses',
  // 20050: 'Password is required and must be between 6 and 128 characters',
  // 20060: 'Gender is required',
  // 20070: 'Date of Birth is required',

  // 20150: 'The email address entered is already active. Please Login',
  // 20160: 'The email address entered is already registered. Please Login',
  // 20170: 'Thats not a valid activation link! Please try your meail again',
  // 20180: 'Your activation link has already been used. Please Login',

  // 20200: 'Registration successful, please check your email for your verification link.',
  // 20210: 'Password Link successful, please check your email for your verification link.',
  // 20220: 'Your password has been successfully changed.',
  // 20230: 'Activation successful.',
  // 20240: 'There was an issue with your activation. Please try again.',

  // // Common - Login
  // 20300: 'The email address entered is not active.',
  // 20310: 'The email address entered is not registered. Please Register',
  // 20320: 'The password entered is incorrect.',
  // 20330: 'Your account has been locked due to too many incorrect login attempts. Please try again in 5 minutes',
  // 20340: 'The email address entered is associated with a deactivated account.',
  // 20350: 'You do not have the necessary access permissions.  Do you want to login as someone else?',
  // 20360: 'You must be logged in to access this part of the application.',
  // 20370: 'Login failed. Please check your credentials and try again.',
  // 20380: 'There was a problem with authenticating: {{exception}}.',

  // // Common - Forgot Password
  // 20500: 'Cannot find user for selected password reset link. Click on the link in your email again or request a new one below',
  // 20510: 'Your password reset link has already been used. Please request a new one below',
  // 20520: 'Your password reset link has expired.',
  // 20530: 'The passwords that you entered do not match. Please try again',

  // // Common - Account
  // 20600: 'Your account has been successfully updated.',
  // 20610: 'Error retrieving other login tokens. Please try again',
  // 20620: 'Error retrieving linked accounts. Please try again',


  // 'register.activationSent': 'Registration successful, please check your email for your verification link.',
  // 'register.passwordLinkSent': 'Password Link successful, please check your email for your verification link.',
  // 'register.passwordChanged': 'Your password has been successfully changed.',
  // 'register.activationSuccessful': 'Activation successful.',
  // 'register.activationError': 'There was an issue with your activation. Please try again.',
  // 'account.accountUpdated': 'Your account has been successfully updated.',
  // 'errors.route.changeError': 'Route change error',
  // 'errors.database.error': 'An unexpected error occurred. Please try again.',
  // // 'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
  // // 'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
  // // 'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
  // // 'crud.user.save.error':"Something went wrong when saving a user...",
  // // 'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
  // // 'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
  // // 'crud.project.save.error':"Something went wrong when saving a project...",
  // 'login.reason.notAuthorized': 'You do not have the necessary access permissions.  Do you want to login as someone else?',
  // 'login.reason.notAuthenticated': 'You must be logged in to access this part of the application.',
  // 'login.error.invalidCredentials': 'Login failed.  Please check your credentials and try again.',
  // 'login.error.serverError': 'There was a problem with authenticating: {{exception}}.',
  // 'saved': 'Successfully saved.',
  // 'removed': 'Successfully removed.',

  'generic.saved': {
    code: 10010,
    message: 'Successfully saved.'
  },
  'generic.updated': {
    code: 10020,
    message: 'Successfully updated.'
  },
  'generic.removed': {
    code: 10030,
    message: 'Successfully removed.'
  },
  'generic.error': {
    code: 10510,
    message: 'An unexpected error occured. We\'ll look into that.'
  },
  'generic.routeError': {
    code: 10520,
    message: 'Route change error. Now that\'s embarrasing!'
  },
  'generic.removalHeader': {
    code: 10530,
    message: 'Confirm removal'
  },

  // Common - Registration
  'common.register.firstNameRequired': {
    code: 20010,
    message: 'First Name is required.'
  },
  'common.register.lastNameRequired': {
    code: 20020,
    message: 'Last Name is required.'
  },
  'common.register.validEmailRequired': {
    code: 20030,
    message: 'Valid email required.'
  },
  'common.register.disposableEmail': {
    code: 20040,
    message: 'We are a community here. Please do not use disposable email addresses.'
  },
  'common.register.passwordConditions': {
    code: 20050,
    message: 'Password must be between 6 and 128 characters.'
  },
  'common.register.genderRequired': {
    code: 20060,
    message: 'Gender is required.'
  },
  'common.register.dobRequired': {
    code: 20070,
    message: 'Date of Birth is required.'
  },

  'common.register.userRegisteredAndActive': {
    code: 20150,
    message: 'The email address entered is already active. Please Login.'
  },
  'common.register.userRegisteredNotActive': {
    code: 20160,
    message: 'The email address entered is already registered. Please Login.'
  },
  'common.register.invalidActivationKey': {
    code: 20170,
    message: 'Thats not a valid activation link! Please try your meail again.'
  },
  'common.register.usedActivationKey': {
    code: 20180,
    message: 'Your activation link has already been used. Please Login.'
  },

  'common.register.success': {
    code: 20200,
    message: 'Registration successful, please check your email for your verification link.'
  },
  'common.password.passwordResetLinkSent': {
    code: 20210,
    message: 'Password Link successful, please check your email for your verification link.'
  },
  'common.password.passwordChangeSuccess': {
    code: 20220,
    message: 'Your password has been successfully changed.'
  },
  'common.register.activationSuccess': {
    code: 20230,
    message: 'Activation successful.'
  },
  'common.register.activationFail': {
    code: 20240,
    message: 'There was an issue with your activation. Please try again.'
  },
  'common.register.activationKeyResent': {
    code: 20250,
    message: 'Activation Key has been successfully resent, please check your email for your verification link.'
  },

  // Common - Login
  'common.login.accountNotActive': {
    code: 20300,
    message: 'Your account is not yet active. Please check you email for your activation link.'
  },
  'common.login.accountNotRegistered': {
    code: 20310,
    message: 'The email address entered is not registered. Please try again.'
  },
  'common.login.incorrectPassword': {
    code: 20320,
    message: 'The password entered is incorrect.'
  },
  'common.login.accountSuspended': {
    code: 20330,
    message: 'Your account has been locked due to too many incorrect login attempts. Please try again in 5 minutes.'
  },
  'common.login.accountDeactivated': {
    code: 20340,
    message: 'The email address entered is associated with a deactivated account.'
  },
  'common.login.notAuthorized': {
    code: 20350,
    message: 'You do not have the necessary access permissions.  Do you want to login as someone else?'
  },
  'common.login.notAuthenticated': {
    code: 20360,
    message: 'You must be logged in to access this part of the application.'
  },
  'common.login.loginFailed': {
    code: 20370,
    message: 'Login failed. Please check your credentials and try again.'
  },
  // 'common.login.loginFailedReason': {
  //   code: 20380,
  //   message: 'There was a problem with authenticating: {{exception}}.'
  // },

  // Common - Forgot Password
  'common.password.invalidPasswordKey': {
    code: 20500,
    message: 'Cannot find user for selected password reset link. Click on the link in your email again or request a new one below.'
  },
  'common.password.usedPasswordKey': {
    code: 20510,
    message: 'Your password reset link has already been used. Please request a new one below.'
  },
  'common.password.expiredPasswordKey': {
    code: 20520,
    message: 'Your password reset link has expired.'
  },
  'common.password.passwordsDoNotMatch': {
    code: 20530,
    message: 'The passwords that you entered do not match. Please try again.'
  },

  // Common - Account
  'common.account.updated': {
    code: 20600,
    message: 'Your account has been successfully updated.'
  },
  'common.account.tokenError': {
    code: 20610,
    message: 'Error retrieving other login tokens. Please try again.'
  },
  'common.account.linkedAccountError': {
    code: 20620,
    message: 'Error retrieving linked accounts. Please try again.'
  },
  'common.account.confirmLinkedDelete': {
    code: 20630,
    message: 'Are you sure you want to remove the linked account?'
  },
  'common.account.linkedAccountDeleteError': {
    code: 20670,
    message: 'Error removing linked account. Please try again.'
  }

});