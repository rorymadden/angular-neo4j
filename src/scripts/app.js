'use strict';

angular.module('angularNeo4jApp', [
  'ui.state',
  'ui.bootstrap',
  'security',
  'account',
  'system.messages',
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'services.titleService',
  'templates-main'
])

// .config(['$routeProvider', '$locationProvider', 'securityAuthorizationProvider', function ($routeProvider, $locationProvider, securityAuthorizationProvider) {
//   $locationProvider.html5Mode(true);
//   $routeProvider
//     .when('/home', {
//       templateUrl: 'home.tpl.html',
//       resolve: securityAuthorizationProvider.requireAuthenticatedUser
//     })
//     .otherwise({
//       redirectTo: '/register'
//     });
// }])

.config(['$stateProvider', '$locationProvider', 'securityAuthorizationProvider', '$urlRouterProvider', function ($stateProvider, $locationProvider, securityAuthorizationProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'home.tpl.html',
      resolve: securityAuthorizationProvider.requireAuthenticatedUser
    })
    $urlRouterProvider
      .otherwise('/register');
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
.controller('AppCtrl', ['$scope', 'i18nNotifications', 'security', '$state', function ($scope, i18nNotifications, security, $state) {
  // handle the notifications for
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  // TODO: Do we need an error message? Something went wrong, how to log?
  // $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
  //   console.log(event);
  //   console.log(toState);
  //   console.log(toParams);
  //   console.log(fromState);
  //   console.log(fromParams);
  //   console.log(error);
  //   $state.transitionTo(fromState);
  //   // TODO: need to retry the failed route...
  //   i18nNotifications.pushForCurrentRoute('generic.routeError', 'error', {}, {rejection: error});
  // });
  // $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
  //   // console.log($route.last)
  //   // TODO: need to retry the failed route...
  //   i18nNotifications.pushForCurrentRoute('generic.routeError', 'error', {}, {rejection: rejection});
  // });

  $scope.$on('$stateChangeSuccess', function(){
    // get any messages that have been set for this route
    i18nNotifications.getCurrent();
    // refresh the user - e.g. profile update
    // security.requestCurrentUser();
  });
}])

// the HeaderCtrl keeps track of were the user is and changes the links accordingly
.controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker', function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;
  $scope.menu = false;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/home');
    } else {
      $location.path('/register');
    }
  };

  $scope.toggleMenu = function() {
    $scope.menu = !$scope.menu;
  };

  $scope.closeMenu = function() {
    $scope.menu = false;
  };

  // close the menu when a route is changed
  $scope.$watch('$routeChangeStart', function() {
    $scope.closeMenu();
  });

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);