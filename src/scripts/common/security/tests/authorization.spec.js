'use strict';

describe('securityAuthorization', function() {
  var $rootScope, security, securityAuthorization, queue;
  var userResponse, resolved;

  // include the stateProvider
  beforeEach(module('ui.state'));
  // create a mock for home (called during logout)
  beforeEach(module(function ($stateProvider) {
    $stateProvider
      .state('register', { url: "/register" })
      .state('register.show', { url: "/" });
  }));
  beforeEach(module('system.messages', 'services.titleService', 'security.authorization', 'scripts/common/security/login/assets/templates/form.tpl.html'));
  // beforeEach(module('security.authorization', 'security'));
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    securityAuthorization = $injector.get('securityAuthorization');
    security = $injector.get('security');
    queue = $injector.get('securityRetryQueue');

    userResponse = { user: { id: '1234567890', email: 'jo@bloggs.com', first: 'Jo', last: 'Bloggs'} };
    resolved = false;

    spyOn(security, 'requestCurrentUser').andCallFake(function() {
      security.currentUser = security.currentUser || userResponse.user;
      var promise = $injector.get('$q').when(security.currentUser);
      // Trigger a digest to resolve the promise;
      return promise;
    });
  }));

  describe('requireAuthenticatedUser', function() {
    it('makes a GET request to current-user url', function() {
      expect(security.isAuthenticated()).toBe(false);
      securityAuthorization.requireAuthenticatedUser().then(function() {
        resolved = true;
        expect(security.isAuthenticated()).toBe(true);
        expect(security.currentUser).toBe(userResponse.user);
      });
      $rootScope.$digest();
      expect(resolved).toBe(true);
    });
    it('adds a new item to the retry queue if not authenticated', function () {
      var resolved = false;
      userResponse.user = null;
      expect(queue.hasMore()).toBe(false);
      securityAuthorization.requireAuthenticatedUser().then(function() {
        resolved = true;
        expect(security.isAuthenticated()).toBe(false);
        expect(queue.hasMore()).toBe(true);
        expect(queue.retryReason()).toBe('unauthenticated-client');
      });
      $rootScope.$digest();
      expect(resolved).toBe(false);
    });
  });

  describe('requireAdminUser', function() {
    it('returns a resolved promise if we are already an admin', function() {
      var userInfo = {admin: true};
      security.currentUser = userInfo;
      expect(security.isAdmin()).toBe(true);
      securityAuthorization.requireAdminUser().then(function() {
        resolved = true;
      });
      $rootScope.$digest();
      expect(security.currentUser).toBe(userInfo);
      expect(resolved).toBe(true);
    });
    it('adds a new item to the retry queue if not admin', function() {
      expect(queue.hasMore()).toBe(false);
      securityAuthorization.requireAdminUser().then(function() {
        resolved = true;
        expect(security.isAdmin()).toBe(false);
        expect(queue.hasMore()).toBe(true);
        expect(queue.retryReason()).toBe('unauthorized-client');
      });
      $rootScope.$digest();
      expect(resolved).toBe(false);
    });
  });
});
