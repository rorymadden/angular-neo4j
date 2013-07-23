'use strict';

var app = angular.module('angularNeo4jApp', [
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

app.config(['$stateProvider', '$locationProvider', 'securityAuthorizationProvider', '$urlRouterProvider', function ($stateProvider, $locationProvider, securityAuthorizationProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('home', {
      url: '/',
      resolve: app.defaultHome,
      templateUrl: 'home.tpl.html'
    })
    .state('404', {
      url: '/404',
      templateUrl: '404.tpl.html'
    });
  $urlRouterProvider
    .otherwise('/404');
}]);

// redirect authenticated user to home page if accessing a page that is for anonymous users
app.defaultHome = {
  authenticated : ['security', '$location', function(security, $location){
    security.requestCurrentUser().then(function(user){
      if(!user) $location.path('/register');
      return true;
    });
  }]
};

// Get the current user when the application starts
// (in case they are still logged in from a previous session)
app.run(['security', function (security) {
  security.requestCurrentUser();
}]);

app.run(['titleService', function (titleService) {
  // used to set the page title which will be outside of each route controller
  titleService.setPrefix('Angular Neo4j | ' );
}]);

// the AppCtrl handles the management of notifications.
// if there is ever an error there will be a generic error
// if there is a successful route change then the notifications for that url will be requested
app.controller('AppCtrl', ['$scope', 'i18nNotifications', function ($scope, i18nNotifications) {
  // handle the notifications for
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  // TODO: change the loading from a notification to something else
  $scope.$on("$stateChangeStart", function () {
    // i18nNotifications.removeAll();
    i18nNotifications.pushForCurrentRoute('generic.loading', 'info', {}, {});
  });
  $scope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
    // $state.transitionTo(fromState.name);
    i18nNotifications.removeAll();
    i18nNotifications.pushForCurrentRoute('generic.routeError', 'error', {}, {error: error});
  });

  $scope.$on('$stateChangeSuccess', function(){
    // remove loading
    i18nNotifications.remove('generic.loading', 'info');
    // get any messages that have been set for this route
    i18nNotifications.getCurrent();
    // refresh the user - e.g. profile update
    // security.requestCurrentUser();
  });
}]);

// the HeaderCtrl keeps track of were the user is and changes the links accordingly
app.controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker', function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;
  $scope.menu = false;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/');
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