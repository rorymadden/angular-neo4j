angular.module('system.messages', [])

.constant('I18N.MESSAGES', {

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
  'generic.loading': {
    code: 10540,
    message: 'Loading...'
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
  'common.account.facebookSuccess': {
    code: 20625,
    message: 'Your facebook account has been successfully linked.'
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