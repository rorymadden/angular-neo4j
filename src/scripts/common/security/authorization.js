'use strict';

angular.module('security.authorization', ['security.service'])

// This service provides guard methods to support AngularJS routes.
// You can add them as resolves to routes to require authorization levels
// before allowing a route change to complete
.provider('securityAuthorization', {

  requireAdminUser: ['securityAuthorization', ['securityAuthorization', function (securityAuthorization) {
    return securityAuthorization.requireAdminUser();
  }]],

  requireAuthenticatedUser: ['securityAuthorization', ['securityAuthorization', function (securityAuthorization) {
    return securityAuthorization.requireAuthenticatedUser();
  }]],

  // isAuthenticated: ['securityAuthorization', function (securityAuthorization) {
  //   return securityAuthorization.isAuthenticated();
  // }],

  $get: ['security', 'securityRetryQueue', function (security, queue) {
    var service = {

      // Require that there is an authenticated user
      // (use this in a route resolve to prevent non-authenticated users from entering that route)
      requireAuthenticatedUser: function () {
        var promise = security.requestCurrentUser().then(function () {
          if (!security.isAuthenticated()) {
            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
          }
        });
        return promise;
      },

      // Require that there is an administrator logged in
      // (use this in a route resolve to prevent non-administrators from entering that route)
      requireAdminUser: function () {
        var promise = security.requestCurrentUser().then(function () {
          if (!security.isAdmin()) {
            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
          }
        });
        return promise;
      },

      // Require that there is an administrator logged in
      // (use this in a route resolve to prevent non-administrators from entering that route)
      // isAuthenticated: function () {
      //   var promise = security.requestCurrentUser().then(function () {
      //     return security.isAuthenticated();
      //   });
      //   return promise;
      // }

    };

    return service;
  }]
});