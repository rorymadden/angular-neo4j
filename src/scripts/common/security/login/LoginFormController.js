'use strict';

angular.module('security.login.form', ['services.localizedMessages', 'ngSanitize'])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', '$location', 'security', 'localizedMessages', 'titleService', 'I18N.MESSAGES', function ($scope, $location, security, localizedMessages, titleService, i18nMessages) {
  titleService.setTitle('Login');

  // The model for this form
  $scope.user = {};

  // Any error message from failing to login
  $scope.authError = null;

  // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
  // We could do something diffent for each reason here but to keep it simple...
  $scope.authReason = null;
  if (security.getLoginReason()) {
    $scope.authReason = (security.isAuthenticated()) ?
      localizedMessages.get('common.login.notAuthorized') :
      localizedMessages.get('common.login.notAuthenticated');
  }

  // Attempt to authenticate the user specified in the form's model
  $scope.login = function () {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to login
    security.login($scope.user.email, $scope.user.password, $scope.user.remember_me).then(function (loggedIn) {
      if (!loggedIn) {
        // If we get here then the login failed due to bad credentials
        $scope.authError = localizedMessages.get('common.login.loginFailed');
      }
    }, function (x) {
      // If we get here then there was a problem with the login request to the server
      var error = x.data.error || x.data;
      $scope.authError = localizedMessages.get(error);
      $scope.user.password = null;
    });
  };

  $scope.clearForm = function () {
    $scope.user = {};
  };

  $scope.cancelLogin = function () {
    security.cancelLogin();
  };

  $scope.forgotPassword = function () {
    security.cancelLogin();
    $location.path('/forgotPassword');
  };

  $scope.resendActivation = function () {
    security.cancelLogin();
    $location.path('/resendActivation');
  };

  $scope.showResendLink = function() {
    if($scope.authError && ($scope.authError === i18nMessages[20300] || $scope.authError === i18nMessages[20340]))
      return true;
    else return false;
  };
}]);