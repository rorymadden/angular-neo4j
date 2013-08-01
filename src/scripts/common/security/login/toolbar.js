'use strict';

angular.module('security.login.toolbar', [])

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
.directive('loginToolbar', ['security', '$state', function (security, $state) {
  var directive = {
    templateUrl: 'scripts/common/security/login/assets/templates/toolbar.tpl.html',
    restrict: 'E',
    replace: true,
    scope: true,
    // link: function ($scope, $element, $attrs, $controller) {
    link: function ($scope) {
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.login = security.showLogin;
      $scope.register = function() {
        $state.transitionTo('register.show');
      };
      $scope.logout = security.logout;
      $scope.$watch(function () {
        return security.currentUser;
      }, function (currentUser) {
        $scope.currentUser = currentUser;
      });
    }
  };
  return directive;
}]);