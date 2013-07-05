describe('account registration tests', function(){

  var $httpBackend, $rootScope, createController, notifications, messages;
  beforeEach(module('account.register'));
  beforeEach(module('services.notifications'));
  beforeEach(module('system.messages'));
  beforeEach(module('services.titleService'));
  beforeEach(module('security'));
  beforeEach(module('scripts/common/account/assets/templates/terms.tpl.html'));
  beforeEach(inject(function($injector) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    // backend definition common for all tests


    // Get hold of a scope (i.e. the root scope)
    $rootScope = $injector.get('$rootScope');
    notifications = $injector.get('notifications');
    // messages = $injector.get('system.messages');
  }));


  it('should register a new user', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $controller('RegisterCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/register').respond(200);

    // verify the initial setup
    expect($scope.genders.length).toEqual(2);


    // setup user and register
    $scope.user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', password:'password'};
    $scope.registerUser();
    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/register').respond(200, '');
    //test user set to null
    expect($scope.user).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.success'].message);

  }]));

  it('should fail on bad register request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $controller('RegisterCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/register').respond(412, {code: 10510});

    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', password:'password'};
    $scope.user = user;
    $scope.registerUser();
    // flush http response and simulate route change
    $httpBackend.flush();
    // $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/register').respond(401, {code: 10510});
    //test user set to null
    expect($scope.user).toEqual(user);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['generic.error'].message);

  }]));

  // TODO: revisit after modal re-work
  // it('should open the terms dialog', inject(function ($controller) {
  //   // set up controller with a scope
  //   var $scope = $rootScope.$new();
  //   $controller('RegisterCtrl', { $scope: $scope});
  //   $scope.terms();
  //   // $httpBackend.flush();
  //   $scope.$digest();

  //   var div = document.querySelector('.modal-header');
  //   expect(angular.element(div).length).toBeGreaterThan(0);
  // }));

  it('should resend Activation', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('ResendActivationCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/resendActivation').respond(200);

    $scope.user = { email: 'testuser@test.com'};
    $scope.resendActivation();
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/resendActivation').respond(200, '');
    //test user set to null
    expect($scope.user).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.success'].message);
  }]));

  it('should fail on bad resend Activation request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('ResendActivationCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/resendActivation').respond(412, {code: 20150});

    var user = { email: 'testuser@test.com'};
    $scope.user = user;
    $scope.resendActivation();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/resendActivation').respond(412, {code: 20150});
    //test user set to null
    expect($scope.user).toEqual(user);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

  it('should resend Password Link', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('ForgotPasswordCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/forgotPassword').respond(200);

    $scope.user = { email: 'testuser@test.com'};
    $scope.forgotPassword();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(200, '');
    //test user set to null
    expect($scope.user).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should fail on bad resend Password Link request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('ForgotPasswordCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/forgotPassword').respond(412, {code: 20210});

    var user = { email: 'testuser@test.com'};
    $scope.user = user;
    $scope.forgotPassword();
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(412, {code: 20210});
    //test user set to null
    expect($scope.user).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should change Password', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = {password:'password', passwordConfirm: 'password'}
    $controller('ChangeForgottenPwdCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/resetPassword').respond(200);
    $httpBackend.when('GET', '/api/user/current-user').respond(user);

    $scope.user = user;
    $httpBackend.expectGET('/api/user/current-user')
    $scope.changeForgottenPassword();
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectPOST('/api/user/resetPassword').respond(200, '');
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordChangeSuccess'].message);
  }]));

  it('should fail on bad change Password link', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = {password:'password', passwordConfirm: 'password'}
    $controller('ChangeForgottenPwdCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/resetPassword').respond(412, {code: 20500});

    $scope.user = user;
    $scope.changeForgottenPassword();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/resetPassword').respond(412, {code: 20500});
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.invalidPasswordKey'].message);
  }]));
});
