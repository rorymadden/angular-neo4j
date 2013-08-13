'use strict';

var registerModule = angular.module('account.register', ['services.i18nNotifications', 'ui.bootstrap.dialog']);

registerModule.controller('RegisterCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', '$dialog', '$window', '$state', function ($scope, $http, i18nNotifications, titleService, $dialog, $window, $state) {
  $scope.user = {};
  titleService.setTitle('Register');

  $scope.genders = [
    { name: 'Male', value: 'male' },
    { name: 'Female', value: 'female' }
  ];

  $scope.registerUser = function () {
    $http.post('/api/user/register', $scope.user)
      .success(function() {
        $state.transitionTo('login');
        i18nNotifications.pushForNextRoute('common.register.success', 'success', {}, {});
        $scope.user = null;
      })
      // .error(function(data, status, headers, config) {
      .error(function(data) {
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };

  $scope.oAuth = function(provider){
    //refresh screen to hit the server route instead of angular
    $window.location.href = '/auth/' + provider;
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
}]);

registerModule.controller('ResendActivationCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', '$state', function ($scope, $http, i18nNotifications, titleService, $state) {
  titleService.setTitle('Resend Activation');
  $scope.user = {};

  $scope.resendActivation = function () {
    $http.post('/api/user/resendActivation', $scope.user)
      .success(function() {
        $state.transitionTo('login');
        i18nNotifications.pushForNextRoute('common.register.activationKeyResent', 'success', {}, {});
        $scope.user = null;
      })
      .error(function(data) {
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);

registerModule.controller('ForgotPasswordCtrl', ['$scope', '$http', '$state', 'i18nNotifications', 'titleService', function ($scope, $http, $state, i18nNotifications, titleService) {
  titleService.setTitle('Forgot Password');
  $scope.user = {};

  $scope.forgotPassword = function(){
    $http.post('/api/user/forgotPassword', $scope.user)
      .success(function(){
        i18nNotifications.pushForCurrentRoute('common.password.passwordResetLinkSent', 'success', {}, {});
        $scope.user = null;
      })
      .error(function(data){
        $scope.user = null;
        $state.transitionTo('register.show');
        i18nNotifications.pushForNextRoute(data, 'error', {}, {});
      });
  };
}]);

registerModule.controller('ChangeForgottenPwdCtrl', ['$scope', '$http', '$state', '$stateParams', 'i18nNotifications', 'titleService', 'security', function ($scope, $http, $state, $stateParams, i18nNotifications, titleService, security) {
  $scope.user = {};
  titleService.setTitle('Reset Password');

  $scope.changeForgottenPassword = function(){
    // copy the route params to the user object for posting to the server
    $scope.user.user_id = $stateParams.user_id;
    $scope.user.passwordResetKey = $stateParams.passwordResetKey;

    $http.post('/api/user/resetPassword', $scope.user)
      .success(function(){
        $state.transitionTo('home');
        // force new current user in case of setting a password for already logged in user (e.g. registered from facebook)
        security.requestCurrentUser(true);
        i18nNotifications.pushForNextRoute('common.password.passwordChangeSuccess', 'success', {}, {});
      })
      .error(function(data){
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);

// redirect authenticated user to home page if accessing a page that is for anonymous users
registerModule.ensureAnonymous = {
  authenticated : ['security', '$state', '$q', function(security, $state, $q){
    var deferred = $q.defer();
    security.requestCurrentUser().then(function(user){
      // if(user)  $location.path('/');
      if(user) $state.transitionTo('home');
      deferred.resolve();
    });
    return deferred.promise;
  }]
};

// activate an account and redirecet
registerModule.activate = {
  activate: ['$http', 'i18nNotifications', '$state', '$stateParams', function($http, i18nNotifications, $state, $stateParams) {
    $http.post('/api/user/activate', { activationKey: $stateParams.activationKey})
      .success(function(){
        i18nNotifications.pushForNextRoute('common.register.activationSuccess', 'success', {}, {});
        // need to trigger the currentUser call to log in user.
        $state.transitionTo('home');

        // return true so that the resolve function will pass
        return true;
      })
      .error(function() {
        i18nNotifications.pushForNextRoute('common.register.activationFail', 'error', {}, {});
        $state.transitionTo('register.resendActivation');
        // return true so that the resolve function will pass
        return true;
      });
  }]
};

//copy url parameters to stateParams and redirect to nicer url
registerModule.validatePasswordReset = {
  redirect: ['$stateParams', '$state', '$q', 'i18nNotifications', '$http',
    function($stateParams, $state, $q, i18nNotifications, $http){

    $http.post('/api/user/validatePasswordReset', $stateParams)
      .success(function(){
        // success
        // $state.transitionTo('register.changeForgottenPassword', $stateParams);
        return true;
      })
      .error(function(data){
        // error
        $state.transitionTo('register.forgotPassword');
        i18nNotifications.pushForNextRoute(data, 'error', {}, {});
        return true;
      });
  }]
};

registerModule.home = {
  redirect: ['$state', 'i18nNotifications', function($state, i18nNotifications){
    console.log('called')
    $state.transitionTo('home');
    i18nNotifications.pushForNextRoute('common.account.facebookSuccess', 'success', {}, {});
    return true;
  }]
};

registerModule.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('register', {
      url: '/register',
      resolve: registerModule.ensureAnonymous,
      abstract:true,
      templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
      controller: 'RegisterCtrl'
    })
    .state('register.show', {
      url: '',
      templateUrl: 'scripts/common/account/assets/templates/registerShow.tpl.html',
      controller: 'RegisterCtrl'
    })
    .state('register.forgotPassword', {
      url: '/forgotPassword',
      templateUrl: 'scripts/common/account/assets/templates/forgotPassword.tpl.html',
      controller: 'ForgotPasswordCtrl'
    })
    .state('register.resendActivation', {
      url: '/resendActivation',
      templateUrl: 'scripts/common/account/assets/templates/resendActivation.tpl.html',
      controller: 'ResendActivationCtrl'
    })
    .state('register.resetPassword', {
      url: '/resetPassword/:user_id/:passwordResetKey',
      templateUrl: 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html',
      controller: 'ChangeForgottenPwdCtrl',
      resolve: registerModule.validatePasswordReset
    })
    .state('register.activate', {
      url: '/:activationKey',
      resolve: registerModule.activate
    });
}]);