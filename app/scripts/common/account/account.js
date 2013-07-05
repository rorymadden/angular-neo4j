angular.module('account', ['account.register', 'account.activate', 'ui.bootstrap.dialog'])

.controller('AccountViewCtrl', ['$scope', '$http', '$location', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, $location, i18nNotifications, security, titleService) {
  titleService.setTitle('Account');

  $scope.user = security.currentUser;
  $scope.account = angular.copy($scope.user);
  $scope.editable = false;
  $scope.genders = [
    { name: "Male", value: "male" },
    { name: "Female", value: "female" }
  ];
  // $scope.$watch('birthday', function() {
  //   // $scope.birthday = $scope.birthday | date:'dd/mm/yyyy';
  // });

  $scope.edit = function(){
    // $location.path('/account/edit');
    // toggle the disabled value
    $scope.editable = true;
  };

  $scope.cancelEdit = function(){
    $scope.account = $scope.user;
    $scope.editable = false;
  };

  $scope.editCheck = function(){
    return $scope.editable;
  }

  $scope.update = function(){
    $http.put('/api/account', $scope.account)
      .success(function(){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.account.updated', 'success', {}, {});
        $scope.user = $scope.account;
        $scope.account.password = null;
        // force the application to update the current user
        // TODO: is it better jsut to set currentUser to account?
        // security.currentUser = $scope.user;
        security.requestCurrentUser(true);
        // toggle uneditable again
        $scope.cancelEdit();
      })
      .error(function(data, status, headers, config) {
        $scope.account.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
        // $scope.authError = data.error.msg.message;
      });
  };

  // $scope.isCancelDisabled = function() {
  //   return angular.equals($scope.account, $scope.user);
  // };

  // $scope.isSaveDisabled = function() {
  //   return $scope.EditProfile.$invalid || angular.equals($scope.account, $scope.user);
  // };
}])

.controller('AccountLinkedCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', 'localizedMessages', '$dialog', '$window', function ($scope, $http, i18nNotifications, security, titleService, localizedMessages, $dialog, $window) {
  $scope.account = security.currentUser;
  titleService.setTitle('Linked Accounts');

  $http.get('/api/account/linkedAccounts')
      .success(function(data){
        var i, len = data.length, providers={};
        for(i=0; i<len; i++){
          $scope[data[i].oAuth.provider] = data[i].oAuth;
        }
        if($scope.facebook) $scope.facebook.picture = 'http://graph.facebook.com/' + $scope.facebook.username + '/picture?width=200&height=200';
        if($scope.google) $scope.google.picture = $scope.google.picture + '?sz=200';
      })
      .error(function(data, status, headers, config){
        // $scope.authError = data;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });

  $scope.oAuth = function(provider){
    $window.location.href = '/auth/' + provider;
  };

  $scope.removeLinkedAccount = function(provider, profileId){
    var title = localizedMessages.get('generic.removalHeader');
    var msg = localizedMessages.get('common.account.confirmLinkedDelete');
    var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

    $dialog.messageBox(title, msg, btns)
      .open()
      .then(function(result){
        if(result === "ok") {
          $http.delete('/api/account/linkedAccounts/' + profileId)
            .success(function(data){
              $scope[provider] = null;
            })
            .error(function(data, status, headers, config) {
              i18nNotifications.removeAll();
              i18nNotifications.pushForCurrentRoute('common.account.linkedAccountDeleteError', 'error', {}, {});
            });
        }
    });
  };

  // $scope.close = function(result){
  //   dialog.close(result);
  // };
}])

.controller('AccountPasswordCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, i18nNotifications, security, titleService) {
  $scope.account = security.currentUser;
  titleService.setTitle('Account: Edit Password');
  $scope.sent = false;

  $scope.update = function(){
    $http.put('/api/account/editPassword', $scope.password)
      .success(function(data) {
        $scope.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.password.passwordChangeSuccess', 'success', {}, {});
      })
      .error(function(data, status, headers, config) {
        $scope.password = null;
        // $scope.authError = data;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
    };

    $scope.sendPasswordLink = function(email){
      $http.post('/api/user/forgotPassword', {email: email})
        .success(function(data){
          $scope.sent = true;
          i18nNotifications.removeAll();
          i18nNotifications.pushForCurrentRoute('common.password.passwordResetLinkSent', 'success', {}, {});
          // $scope.user = null;
        })
        .error(function(data, status, headers, config){
          // $location.path('/account');
          // i18nNotifications.removeAll();
          i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
        });
    };
}])

.controller('AccountGetLoginTokensCtrl', ['$scope', '$http', 'i18nNotifications', 'security', 'titleService', function ($scope, $http, i18nNotifications, security, titleService) {
  $scope.account = security.currentUser;
  titleService.setTitle('Account: Security');

  $http.get('/api/account/security')
    .success(function(data){
      $scope.cookies = data;
    })
    .error(function(data, status, headers, config){
      // $scope.authError = data;
      i18nNotifications.removeAll();
      i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
    });
  $scope.removeToken = function(autoIndexSeries, token){
    $http.delete('/api/account/security/' + autoIndexSeries + '/' + token)
      .success(function(data){
        // refresh the scope
        // var remainingCookies = angular.copy($scope.cookies);
        // remainingCookies.reduce(function (savedCookies, cookie) {
        //   if (cookie.token.token === token) {
        //     return savedCookies;
        //   } else {
        //     return savedCookies.concat(cookie);
        //   }
        // }, []); // => [{ "name": "john", "dinner": "sushi" }]
        // $scope.cookies = remainingCookies;
        var removeByAttr = function(arr, attr, value){
          var i = arr.length;
          while(i--){
           if(arr[i] && arr[i]['token'][attr] && (arguments.length > 2 && arr[i]['token'][attr] === value )){
            arr.splice(i,1);
           }
          }
          return arr;
        };

        removeByAttr($scope.cookies, 'token', token);
      })
      .error(function(data, status, headers, config){
        // $scope.authError = data;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}])

.config(['$routeProvider', 'securityAuthorizationProvider', '$rootScopeProvider', '$httpProvider', function ($routeProvider, securityAuthorizationProvider, $rootScopeProvider, $httpProvider) {
  $routeProvider
    .when('/register', {
      templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
      controller: 'RegisterCtrl'
    })
    .when('/activate/:activationKey', {
      templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
      controller: 'ActivateCtrl'
    })
    .when('/forgotPassword', {
      templateUrl: 'scripts/common/account/assets/templates/forgotPassword.tpl.html',
      controller: 'ForgotPasswordCtrl'
    })
    .when('/resendActivation', {
      templateUrl: 'scripts/common/account/assets/templates/resendActivation.tpl.html',
      controller: 'ResendActivationCtrl'
    })
    .when('/resetPassword/:user_id/:passwordResetKey', {
      templateUrl: 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html',
      controller: 'ChangeForgottenPwdCtrl'
    })
    .when('/account', {
      templateUrl: 'scripts/common/account/assets/templates/account.tpl.html',
      controller: 'AccountViewCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .when('/account/editPassword', {
      templateUrl: 'scripts/common/account/assets/templates/accountPassword.tpl.html',
      controller: 'AccountPasswordCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .when('/account/security', {
      templateUrl: 'scripts/common/account/assets/templates/accountSecurity.tpl.html',
      controller: 'AccountGetLoginTokensCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .when('/account/linkedAccounts', {
      templateUrl: 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html',
      controller: 'AccountLinkedCtrl',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    });
    // .when('/account/deactivate', {
    //   templateUrl: 'views/account/accountDeactivate.html',
    //   controller: 'AccountCtrl'
    // })
    // .when('/auth/:provider', {
    //   templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
    //   controller: 'OAuthCtrl',
    //   resolve: {
    //     provider: function($rootScopeProvider, $httpProvider){
    //       $rootScopeProvider.$on('$locationChangeStart', function(ev) {
    //         ev.preventDefault();
    //         $httpProvider.get('/auth/'+ $params.provider + '/callback');
    //       });
    //     }
    //   }
    // })
    // .when('/auth/:provider/callback', {
    //   templateUrl: 'scripts/common/account/assets/templates/register.tpl.html',
    //   controller: 'OAuthResponseCtrl'
    // })

}]);