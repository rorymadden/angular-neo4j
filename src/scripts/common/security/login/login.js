'use strict';

angular.module('security.login', ['security.login.form', 'security.login.toolbar'])

.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'scripts/common/security/login/assets/templates/login.tpl.html',
      controller: 'LoginFormController',
      resolve: registerModule.ensureAnonymous
    });
}]);