angular.module('security.login', ['security.login.form', 'security.login.toolbar'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'scripts/common/security/login/assets/templates/login.tpl.html',
      controller: 'LoginFormController'
    })
}]);