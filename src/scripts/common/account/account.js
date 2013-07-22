'use strict';

angular.module('account', ['account.register', 'account.activate', 'ui.bootstrap.dialog', 'rorymadden.date-dropdowns'])

.controller('AccountCtrl', ['$scope', 'security', function ($scope, security){
  if(!security.currentuser) {
    // the user has navigated striaght to this page - fetch the user
    security.requestCurrentUser().then(function(user){
      $scope.user = user;
      $scope.account = angular.copy($scope.user);
    });
  }
  else {
    $scope.user = security.currentUser;
    $scope.account = angular.copy($scope.user);
  }
}])

.controller('AccountViewCtrl', ['$scope', '$http', '$location', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, $location, i18nNotifications, security, titleService) {
  titleService.setTitle('Account');

  // $scope.user = security.currentUser;
  // $scope.account = angular.copy($scope.user);
  $scope.editable = false;
  $scope.genders = [
    { name: 'Male', value: 'male' },
    { name: 'Female', value: 'female' }
  ];

  $scope.edit = function(){
    // toggle the disabled value
    $scope.editable = true;
  };

  $scope.cancelEdit = function(saved){
    if(!saved) $scope.account = angular.copy($scope.user);
    $scope.editable = false;
  };

  $scope.editCheck = function(){
    return $scope.editable;
  };

  $scope.update = function(){
    $http.put('/api/account', $scope.account)
      .success(function(){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.account.updated', 'success', {}, {});
        $scope.account.password = null;

        // force the application to update the current user
        security.requestCurrentUser(true);

        // toggle uneditable again
        $scope.cancelEdit(true);
      })
      .error(function(data) {
        $scope.account.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}])

.controller('AccountLinkedCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', 'localizedMessages', '$dialog', '$window', function ($scope, $http, i18nNotifications, security, titleService, localizedMessages, $dialog, $window) {
  titleService.setTitle('Account: Linked Accounts');

  $http.get('/api/account/linkedAccounts')
      .success(function(data){
        var i, len = data.length;
        for(i=0; i<len; i++){
          $scope[data[i].provider] = data[i];
        }
        if($scope.facebook) {
          $scope.facebook.picture = 'http://graph.facebook.com/' + $scope.facebook.username + '/picture?width=200&height=200';
        }
        if($scope.google) {
          $scope.google.picture = $scope.google.picture + '?sz=200';
        }
      })
      .error(function(data){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });

  $scope.oAuth = function(provider){
    $window.location.href = '/auth/' + provider;
  };

  $scope.removeLinkedAccount = function(provider, id){
    var title = localizedMessages.get('generic.removalHeader');
    var msg = localizedMessages.get('common.account.confirmLinkedDelete');
    var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

    $dialog.messageBox(title, msg, btns)
      .open()
      .then(function(result){
        if(result === 'ok') {
          $http.delete('/api/account/linkedAccounts/' + id)
            .success(function(){
              $scope[provider] = null;
            })
            .error(function() {
              i18nNotifications.removeAll();
              i18nNotifications.pushForCurrentRoute('common.account.linkedAccountDeleteError', 'error', {}, {});
            });
        }
      });
  };
}])

.controller('AccountPasswordCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, i18nNotifications, security, titleService) {
  titleService.setTitle('Account: Edit Password');
  $scope.sent = false;

  $scope.update = function(){
    $http.put('/api/account/editPassword', $scope.password)
      .success(function() {
        $scope.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.password.passwordChangeSuccess', 'success', {}, {});
      })
      .error(function(data) {
        $scope.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };

  $scope.sendPasswordLink = function(email){
    $http.post('/api/user/forgotPassword', {email: email})
      .success(function(){
        $scope.sent = true;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.password.passwordResetLinkSent', 'success', {}, {});
      })
      .error(function(data){
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}])

.controller('AccountGetLoginTokensCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, i18nNotifications, security, titleService) {
  titleService.setTitle('Account: Security');

  $http.get('/api/account/security')
    .success(function(data){
      $scope.cookies = data;
    })
    .error(function(data){
      // $scope.authError = data;
      i18nNotifications.removeAll();
      i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
    });
  $scope.removeToken = function(id){
    $http.delete('/api/account/security/' + id)
      .success(function(){
        var removeByAttr = function(arr, attr, value){
          var i = arr.length;
          while(i--){
            if(arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )){
              arr.splice(i,1);
            }
          }
          return arr;
        };

        removeByAttr($scope.cookies, '_id', id);
      })
      .error(function(data){
        // $scope.authError = data;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}])

// .config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
//   $routeProvider
//     .when('/register', {
//       templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
//       controller: 'RegisterCtrl'
//     })
//     .when('/activate/:activationKey', {
//       templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
//       controller: 'ActivateCtrl'
//     })
//     .when('/forgotPassword', {
//       templateUrl: 'scripts/common/account/assets/templates/forgotPassword.tpl.html',
//       controller: 'ForgotPasswordCtrl'
//     })
//     .when('/resendActivation', {
//       templateUrl: 'scripts/common/account/assets/templates/resendActivation.tpl.html',
//       controller: 'ResendActivationCtrl'
//     })
//     .when('/resetPassword/:user_id/:passwordResetKey', {
//       templateUrl: 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html',
//       controller: 'ChangeForgottenPwdCtrl'
//     })
//     .when('/account', {
//       templateUrl: 'scripts/common/account/assets/templates/account.tpl.html',
//       controller: 'AccountViewCtrl',
//       resolve: securityAuthorizationProvider.requireAuthenticatedUser
//     })
//     .when('/account/editPassword', {
//       templateUrl: 'scripts/common/account/assets/templates/accountPassword.tpl.html',
//       controller: 'AccountPasswordCtrl',
//       resolve: securityAuthorizationProvider.requireAuthenticatedUser
//     })
//     .when('/account/security', {
//       templateUrl: 'scripts/common/account/assets/templates/accountSecurity.tpl.html',
//       controller: 'AccountGetLoginTokensCtrl',
//       resolve: securityAuthorizationProvider.requireAuthenticatedUser
//     })
//     .when('/account/linkedAccounts', {
//       templateUrl: 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html',
//       controller: 'AccountLinkedCtrl',
//       resolve: securityAuthorizationProvider.requireAuthenticatedUser
//     });
//     // .when('/account/deactivate', {
//     //   templateUrl: 'views/account/accountDeactivate.html',
//     //   controller: 'AccountCtrl'
//     // })
// }]);

.config(['$stateProvider', 'securityAuthorizationProvider', function ($stateProvider, securityAuthorizationProvider) {
  $stateProvider
    .state('register', {
      url: '/register',
      templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
      controller: 'RegisterCtrl'
    })
    .state('activate', {
      url: '/activate/:activationKey',
      templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
      controller: 'ActivateCtrl'
    })
    .state('forgotPassword', {
      url: '/forgotPassword',
      templateUrl: 'scripts/common/account/assets/templates/forgotPassword.tpl.html',
      controller: 'ForgotPasswordCtrl'
    })
    .state('resendActivation', {
      url: '/resendActivation',
      templateUrl: 'scripts/common/account/assets/templates/resendActivation.tpl.html',
      controller: 'ResendActivationCtrl'
    })
    .state('resetPassword', {
      url: '/resetPassword/:user_id/:passwordResetKey',
      templateUrl: 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html',
      controller: 'ChangeForgottenPwdCtrl'
    })
    // need an abstract account as even though I will navigate there. I need it to behave as a parent
    .state('account', {
      url: '/account',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser,
      abstract: true,
      templateUrl: 'scripts/common/account/assets/templates/account.tpl.html',
      controller: 'AccountCtrl'
    })
    .state('account.show', {
      url: '',
      templateUrl: 'scripts/common/account/assets/templates/accountShow.tpl.html',
      controller: 'AccountViewCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .state('account.editpassword', {
      url: '/editPassword',
      templateUrl: 'scripts/common/account/assets/templates/accountPassword.tpl.html',
      controller: 'AccountPasswordCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .state('account.security', {
      url: '/security',
      templateUrl: 'scripts/common/account/assets/templates/accountSecurity.tpl.html',
      controller: 'AccountGetLoginTokensCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .state('account.linkedaccounts', {
      url: '/linkedAccounts',
      templateUrl: 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html',
      controller: 'AccountLinkedCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    });
    // .when('/account/deactivate', {
    //   templateUrl: 'views/account/accountDeactivate.html',
    //   controller: 'AccountCtrl'
    // })
}]);