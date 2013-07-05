'use strict';

angular.module('angularNeo4jApp', [
  'ui.bootstrap',
  'security',
  'account',
  'system.messages',
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'services.titleService',
  'rorymadden.date-dropdowns'
])

.config(['$routeProvider', '$locationProvider', 'securityAuthorizationProvider', function ($routeProvider, $locationProvider, securityAuthorizationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/home', {
      templateUrl: 'scripts/home.html',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    .otherwise({
      redirectTo: '/register'
    });
}])


  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
.run(['security', function (security) {
  security.requestCurrentUser();
}])

.run(['titleService', function (titleService) {
  // used to set the page title which will be outside of each route controller
  titleService.setPrefix('Angular Neo4j | ' );
}])

// the AppCtrl handles the management of notifications.
// if there is ever an error there will be a generic error
// if there is a successful route change then the notifications for that url will be requested
.controller('AppCtrl', ['$scope', 'i18nNotifications', 'security', function ($scope, i18nNotifications, security) {
  // handle the notifications for
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
    // TODO: need to retry the failed route...
    i18nNotifications.pushForCurrentRoute('generic.routeError', 'error', {}, {rejection: rejection});
  });

  $scope.$on('$routeChangeSuccess', function(){
    // get any messages that have been set for this route
    i18nNotifications.getCurrent();
    // refresh the user - e.g. profile update
    security.requestCurrentUser();
  });
}])

// the HeaderCtrl keeps track of were the user is and changes the links accordingly
.controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker', function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/home');
    } else {
      $location.path('/register');
    }
  };

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);