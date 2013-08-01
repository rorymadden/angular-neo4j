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
]);

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
  authenticated : ['security', '$state', '$q', function(security, $state, $q){
    var deferred = $q.defer();
    security.requestCurrentUser().then(function(user){
      if(!user) $state.transitionTo('register.show');
      deferred.resolve();
    });
    return deferred.promise;
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
app.controller('AppCtrl', ['$scope', 'i18nNotifications', '$state', function ($scope, i18nNotifications, $state) {
  $scope.loading = false;
  // handle the notifications for
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on("$stateChangeStart", function () {
    i18nNotifications.removeAll();
    //show spinner
    $scope.loading = true;
  });

  $scope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
    $state.transitionTo(fromState.name, {}, true);
    i18nNotifications.removeAll();
    i18nNotifications.pushForCurrentRoute('generic.routeError', 'error', {}, {error: error});
  });

  $scope.$on('$stateChangeSuccess', function(){
    // remove spinner
    $scope.loading = false;

    // get any messages that have been set for this route
    i18nNotifications.getCurrent();
  });
}]);

// the HeaderCtrl keeps track of were the user is and changes the links accordingly
app.controller('HeaderCtrl', function ($scope, $state, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $state;
  $scope.menuOpen = false;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $state.transitionTo('home');
    } else {
      $state.transitionTo('register.show');
    }
  };

  $scope.toggleMenu = function() {
    $scope.menuOpen = !$scope.menuOpen;
  };

  $scope.closeMenu = function() {
    $scope.menuOpen = false;
  };

  // close the menu when a route is changed
  $scope.$watch('$stateChangeStart', function() {
    $scope.closeMenu();
  });
  // close the menu when a route is changed
  $scope.$on('$stateChangeSuccess', function() {
    $scope.breadcrumbs = breadcrumbs.getAll();
  });

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getParentRoute();
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
});