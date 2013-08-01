'use strict';

var accountModule = angular.module('account', ['account.register', 'ui.bootstrap.dialog', 'rorymadden.date-dropdowns']);

accountModule.controller('AccountCtrl', ['$scope', 'security', function ($scope, security){
  security.requestCurrentUser().then(function(user){
    $scope.user = angular.copy(user);
    $scope.account = angular.copy(user);
  });

  $scope.$on('UserUpdateCancelled', function(event, account){
    $scope.account = account;
  });

  $scope.$watch(function () {
    return security.currentUser;
  }, function (currentUser) {
    $scope.user = currentUser;
  });
}]);

accountModule.controller('AccountViewCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', 'security', function ($scope, $http, i18nNotifications, titleService, security) {
  titleService.setTitle('Account');

  $scope.editable = false;
  $scope.genders = [
    { name: 'Male', value: 'male' },
    { name: 'Female', value: 'female' }
  ];

  $scope.edit = function(){
    // toggle the disabled value
    $scope.editable = true;
  };

  $scope.cancelEdit = function(){
    $scope.account = angular.copy($scope.user);
    $scope.editable = false;
    $scope.$emit('UserUpdateCancelled', $scope.account);
  };

  $scope.editCheck = function(){
    return $scope.editable;
  };

  $scope.update = function(){
    $http.put('/api/account', $scope.account)
      .success(function(){
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute('common.account.updated', 'success', {}, {});
        delete $scope.account.password;

        // set the currentUser to the updated value
        // triggers watches
        security.currentUser = angular.copy($scope.account);

        // toggle uneditable again
        $scope.editable = false;
      })
      .error(function(data) {
        $scope.account.password = null;
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);

var AccountLinkedCtrl = accountModule.controller('AccountLinkedCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', 'localizedMessages', '$dialog', '$window', 'linkedAccounts', function ($scope, $http, i18nNotifications, titleService, localizedMessages, $dialog, $window, linkedAccounts) {
  titleService.setTitle('Account: Linked Accounts');

  //process resolved data
  var data = linkedAccounts.data;
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
              i18nNotifications.removeAll();
              $scope[provider] = null;
            })
            .error(function(data) {
              i18nNotifications.removeAll();
              i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
            });
        }
      });
  };
}]);

// resolve linkedAccounts, to ensure that the page doesn't show up without information
AccountLinkedCtrl.getLinkedAccounts = {
  linkedAccounts: ['$http', function($http) {
    return $http({
      method: 'GET',
      url: '/api/account/linkedAccounts'
    });
  }]
};
// AccountLinkedCtrl.getLinkedAccounts = {
//   linkedAccounts: ['$q', '$timeout', '$http', function($q, $timeout, $http) {
//     var deferred = $q.defer();

//     $http({method: 'GET', url: '/api/account/linkedAccounts'})
//       .success(function(data){
//         $timeout(function(){
//           deferred.reject(data);
//         }, 2000)
//       });

//     return deferred.promise;
//   }]
// };

accountModule.controller('AccountPasswordCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', function ($scope, $http, i18nNotifications, titleService) {
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
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);


var AccountGetLoginTokensCtrl = accountModule.controller('AccountGetLoginTokensCtrl', ['$scope', '$http', 'i18nNotifications', 'titleService', 'cookies', function ($scope, $http, i18nNotifications, titleService, cookies) {
  titleService.setTitle('Account: Security');

  $scope.cookies = cookies.data;

  $scope.removeToken = function(id){
    $http.delete('/api/account/security/' + id)
      .success(function(){
        i18nNotifications.removeAll();
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
        i18nNotifications.removeAll();
        i18nNotifications.pushForCurrentRoute(data, 'error', {}, {});
      });
  };
}]);

// resolve cookies for accounts, to ensure that the page doesn't show up without information
AccountGetLoginTokensCtrl.getLoginTokens = {
  cookies: ['$http', function($http) {
    return $http({
      method: 'GET',
      url: '/api/account/security'
    });
  }]
};



accountModule.config(['$stateProvider', 'securityAuthorizationProvider', function ($stateProvider, securityAuthorizationProvider) {
  $stateProvider
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
      controller: 'AccountViewCtrl'
    })
    .state('account.editpassword', {
      url: '/editPassword',
      templateUrl: 'scripts/common/account/assets/templates/accountPassword.tpl.html',
      controller: 'AccountPasswordCtrl'
    })
    .state('account.security', {
      url: '/security',
      templateUrl: 'scripts/common/account/assets/templates/accountSecurity.tpl.html',
      controller: 'AccountGetLoginTokensCtrl',
      resolve: AccountGetLoginTokensCtrl.getLoginTokens
    })
    .state('account.linkedaccounts', {
      url: '/linkedAccounts',
      templateUrl: 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html',
      controller: 'AccountLinkedCtrl',
      resolve: AccountLinkedCtrl.getLinkedAccounts
    });
    // .when('/account/deactivate', {
    //   templateUrl: 'views/account/accountDeactivate.html',
    //   controller: 'AccountCtrl'
    // })
}]);

// accountModule.config(['$routeProvider', function($routeProvider){
//   $routeProvider
//     .when('/account', {
//       templateUrl: 'scripts/common/account/assets/templates/account.tpl.html',
//       controller: 'AccountViewCtrl'
//     })
//     .when('/account/editPassword', {
//       templateUrl: 'scripts/common/account/assets/templates/accountPassword.tpl.html',
//             controller: 'AccountPasswordCtrl'
//     })
// }]);

