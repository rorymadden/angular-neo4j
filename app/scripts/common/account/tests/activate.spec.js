describe('account activation tests', function(){

  var $httpBackend, $rootScope, createController, notifications, messages;
  beforeEach(module('account.activate'));
  beforeEach(module('services.notifications'));
  beforeEach(module('system.messages'));
  beforeEach(module('services.titleService'));
  beforeEach(inject(function($injector) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    // backend definition common for all tests


    // Get hold of a scope (i.e. the root scope)
    $rootScope = $injector.get('$rootScope');
    notifications = $injector.get('notifications');
    // messages = $injector.get('system.messages');
  }));


  it('should activate a new account', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $httpBackend.when('POST', '/api/user/activate').respond(200);
    $controller('ActivateCtrl', { $scope: $scope});

    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/activate').respond(200, '');

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.activationSuccess'].message);

  }]));

  it('should fail on bad register request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $httpBackend.when('POST', '/api/user/activate').respond(412, {code: 10510});
    $controller('ActivateCtrl', { $scope: $scope});

    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/activate').respond(401, {code: 10510});

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.activationFail'].message);

  }]));
});
