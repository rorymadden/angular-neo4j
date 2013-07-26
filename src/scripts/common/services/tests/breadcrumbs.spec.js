'use strict';

describe('breadcrumbs', function () {

  var $state, $rootScope, breadcrumbs;

  beforeEach(module('services.breadcrumbs', 'ui.state'));

  // create a mock for home (called during logout)
  beforeEach(module(function ($stateProvider) {
    $stateProvider
      .state('register', { url: "/register" })
      .state('register.forgotPassword', { url: "/forgotPassword" });
  }));

  beforeEach(inject(function($injector) {
    breadcrumbs = $injector.get('breadcrumbs');
    $rootScope = $injector.get('$rootScope');
    $state = $injector.get('$state');
  }));

  it('should have sensible defaults before route navigation', function() {
    expect(breadcrumbs.getAll()).toEqual([]);
    expect(breadcrumbs.getParentRoute()).toEqual({});
  });

  it('should not expose breadcrumbs before route change success', function () {
    $state.transitionTo('register.forgotPassword');
    expect(breadcrumbs.getAll()).toEqual([]);
    expect(breadcrumbs.getParentRoute()).toEqual({});
  });

  it('should correctly parse $state() after route change success', function () {
    $state.transitionTo('register.forgotPassword');
    $rootScope.$digest();
    expect($state.current.name).toBe('register.forgotPassword');
    expect(breadcrumbs.getAll()).toEqual([
      { name:'register', path:'/register' },
      { name:'forgotPassword', path:'/register/forgotPassword' }
    ]);
    expect(breadcrumbs.getParentRoute()).toEqual('register');
  });

});