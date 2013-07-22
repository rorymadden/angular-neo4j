'use strict';

angular.module('account.register', ['services.i18nNotifications', 'ui.bootstrap.dialog'])

.controller('RegisterCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', '$dialog', '$window', '$location', function ($scope, $http, i18nNotifications, titleService, $dialog, $window, $location) {
  $scope.user = {};
  titleService.setTitle('Register');

  $scope.genders = [
    { name: 'Male', value: 'male' },
    { name: 'Female', value: 'female' }
  ];

  $scope.registerUser = function () {
    $http.post('/api/user/register', $scope.user)
      .success(function() {
        i18nNotifications.removeAll();
        i18nNotifications.pushForNextRoute('common.register.success', 'success', {}, {});
        $scope.user = null;
        $location.path('/login');
      })
      // .error(function(data, status, headers, config) {
      .error(function(data) {
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };

  $scope.oAuth = function(provider){
    $window.location.href = '/auth/' + provider;
    // $http.get('/auth/' + provider)
    //   .success(function(data){
    //     console.log('being called' + data)
    //   })
    //   .error(function(data, status, headers, config) {
    //     console.log(config)
    //   });
  };

  var dialogBox = null;
  function openDialog(url, controller) {
    if ( !dialogBox ) {
      dialogBox = $dialog.dialog();
    }
    dialogBox.open(url, controller).then(onDialogClose);
  }

  function onDialogClose() {
    angular.noop();
  }

  $scope.terms = function(){
    openDialog('scripts/common/account/assets/templates/terms.tpl.html');
  };
}])

.controller('ResendActivationCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', '$location', function ($scope, $http, i18nNotifications, titleService, $location) {
  $scope.user = {};
  titleService.setTitle('Resend Activation');

  $scope.resendActivation = function () {
    $http.post('/api/user/resendActivation', $scope.user)
      .success(function() {
        $location.path('/login');
        i18nNotifications.removeAll();
        i18nNotifications.pushForNextRoute('common.register.activationKeyResent', 'success', {}, {});
        $scope.user = null;
      })
      .error(function(data) {
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}])

.controller('ForgotPasswordCtrl', ['$scope', '$http', '$location', 'i18nNotifications', 'titleService', function ($scope, $http, $location, i18nNotifications, titleService) {
  $scope.user = {};
  titleService.setTitle('Forgot Password');

  $scope.forgotPassword = function(){
    $http.post('/api/user/forgotPassword', $scope.user)
      .success(function(){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.password.passwordResetLinkSent', 'success', {}, {});
        $scope.user = null;
      })
      .error(function(data){
        $scope.user = null;
        $location.path('/register');
        i18nNotifications.removeAll();
        i18nNotifications.pushForNextRoute(data, 'error', {}, {});
      });
  };
}])

.controller('ChangeForgottenPwdCtrl', ['$scope', '$http', '$location', '$routeParams', 'i18nNotifications', 'titleService', 'security', function ($scope, $http, $location, $params, i18nNotifications, titleService, security) {
  $scope.user = {};
  titleService.setTitle('Reset Password');

  $scope.changeForgottenPassword = function(){
    $scope.user.user_id = $params.user_id;
    $scope.user.passwordResetKey = $params.passwordResetKey;
    $http.post('/api/user/resetPassword', $scope.user)
      .success(function(){
        $location.path('/home');
        // force new current user in case of setting a password for already logged in user (e.g. registered from facebook)
        security.requestCurrentUser(true);
        i18nNotifications.removeAll();
        i18nNotifications.pushForNextRoute('common.password.passwordChangeSuccess', 'success', {}, {});
      })
      .error(function(data){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);