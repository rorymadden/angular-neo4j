'use strict';

describe('breadcrumbs', function () {

  var LocationMock = function (initialPath) {
    var pathStr = initialPath || '';
    this.path = function (pathArg) {
      return pathArg ? pathStr = pathArg : pathStr;
    };
  };

  var $state, $rootScope, breadcrumbs;

  beforeEach(module('services.breadcrumbs'));
  beforeEach(inject(function($injector) {
    breadcrumbs = $injector.get('breadcrumbs');
    $rootScope = $injector.get('$rootScope');
    $state = $injector.get('$state');
    spyOn($state, 'path').andCallFake(new LocationMock().path);
  }));

  it('should have sensible defaults before route navigation', function() {
    expect(breadcrumbs.getAll()).toEqual([]);
    expect(breadcrumbs.getParent()).toEqual({});
  });

  it('should not expose breadcrumbs before route change success', function () {
    $state.transitionTo('register.forgotPassword');
    expect(breadcrumbs.getAll()).toEqual([]);
    expect(breadcrumbs.getParent()).toEqual({});
  });

  it('should correctly parse $state() after route change success', function () {
    $state.transitionTo('register.forgotPassword');
    $rootScope.$broadcast('$routeChangeSuccess', {});
    expect(breadcrumbs.getAll()).toEqual([
      { name:'register', path:'/register' },
      { name:'path', path:'/register/path' }
    ]);
    expect(breadcrumbs.getParent()).toEqual('register');
  });

});