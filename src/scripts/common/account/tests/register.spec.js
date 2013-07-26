'use strict';

describe('account registration tests', function(){

  var $httpBackend, $rootScope, notifications;
  beforeEach(module('ui.state'));
  // create a mock for home (called during logout)
  beforeEach(module(function ($stateProvider) {
    $stateProvider.state('home', { url: "/" });
  }));

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

  // //test routes



  // // validate that you cannot access the accounts if not logged in
  it('should test routeProvider: register (logged in)', inject(['$state', 'security', function ($state, security) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    // TODO: why is this still calling account? Fix here or leave until E2E tests?
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/registerShow.tpl.html').respond(200);

    $state.transitionTo('register.show');
    $rootScope.$digest();

    expect($state.current.name).toBe('home');

    // $httpBackEnd
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/registerShow.tpl.html');
  }]));

  it('should test routeProvider: register password (logged in)', inject(['$state', 'security', function ($state, security) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/forgotPassword.tpl.html').respond(200);

    $state.transitionTo('register.forgotPassword');
    $rootScope.$digest();

    expect($state.current.name).toBe('home');

    // $httpBackEnd
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/forgotPassword.tpl.html');
  }]));

  it('should test routeProvider: register resendActivation (logged in)', inject(['$state', 'security', function ($state, security) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/resendActivation.tpl.html').respond(200);

    $state.transitionTo('register.resendActivation');
    $rootScope.$digest();

    expect($state.current.name).toBe('home');

    // $httpBackEnd
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/resendActivation.tpl.html');
  }]));

  it('should test routeProvider: register resetPassword (logged in)', inject(['$state', 'security', function ($state, security) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $httpBackend.when('POST', '/api/user/validatePasswordReset').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html').respond(200);

    $state.transitionTo('register.resetPassword');
    $rootScope.$digest();

    expect($state.current.name).toBe('home');

    // $httpBackEnd
    $httpBackend.expectPOST('/api/user/validatePasswordReset');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/changeForgottenPassword.tpl.html');
  }]));

  it('should test routeProvider: register', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/registerShow.tpl.html').respond(200);

    $state.transitionTo('register.show');
    $rootScope.$digest();

    // expect($state.current.name).toBe('register.show');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/registerShow.tpl.html');
  }]));
  it('should test routeProvider: register password', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/forgotPassword.tpl.html').respond(200);

    $state.transitionTo('register.forgotPassword');
    $rootScope.$digest();

    // expect($state.current.name).toBe('register.forgotPassword');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/forgotPassword.tpl.html');
  }]));
  it('should test routeProvider: register resendActivation', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/resendActivation.tpl.html').respond(200);

    $state.transitionTo('register.resendActivation');
    $rootScope.$digest();

    // expect($state.current.name).toBe('register.resendActivation');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/resendActivation.tpl.html');
  }]));
  it('should test routeProvider: register resetPassword', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('POST', '/api/user/validatePasswordReset').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/changeForgottenPassword.tpl.html').respond(200);

    $state.transitionTo('register.resetPassword');
    $rootScope.$digest();

    // expect($state.current.name).toBe('register.resetPassword');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectPOST('/api/user/validatePasswordReset');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/changeForgottenPassword.tpl.html');
  }]));

  it('should register a new user', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $controller('RegisterCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/register').respond(200);
    $httpBackend.when('GET', 'scripts/common/security/login/assets/templates/login.tpl.html').respond(200);

    // verify the initial setup
    expect($scope.genders.length).toEqual(2);


    // setup user and register
    $scope.user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', password:'password'};
    $scope.registerUser();
    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectGET('scripts/common/security/login/assets/templates/login.tpl.html');
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
    $httpBackend.when('GET', 'scripts/common/security/login/assets/templates/login.tpl.html').respond(200);

    $scope.user = { email: 'testuser@test.com'};
    $scope.resendActivation();
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectGET('scripts/common/security/login/assets/templates/login.tpl.html');
    $httpBackend.expectPOST('/api/user/resendActivation').respond(200, '');
    //test user set to null
    expect($scope.user).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.activationKeyResent'].message);
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
    $httpBackend.when('GET', '/api/user/current-user').respond('user');
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/registerShow.tpl.html').respond(200);

    var user = { email: 'testuser@test.com'};
    $scope.user = user;
    $scope.forgotPassword();
    $httpBackend.flush();
    $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/registerShow.tpl.html');
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
    var user = {password:'password', passwordConfirm: 'password'};
    $controller('ChangeForgottenPwdCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/resetPassword').respond(200);
    $httpBackend.when('GET', '/api/user/current-user').respond(user);

    $scope.user = user;
    $httpBackend.expectGET('/api/user/current-user');
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
    var user = {password:'password', passwordConfirm: 'password'};
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

  it('should activate a new account', inject(['$controller', 'I18N.MESSAGES', '$state', function ($controller, i18nMessages, $state){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $httpBackend.when('POST', '/api/user/activate').respond(200);
    $httpBackend.when('GET', '/api/user/current-user').respond('user');
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/resendActivation.tpl.html').respond(200);
    // $controller('ActivateCtrl', { $scope: $scope});
    $state.transitionTo('register.activate');

    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$stateChangeSuccess', {});

    // test api called
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/resendActivation.tpl.html');
    $httpBackend.expectPOST('/api/user/activate').respond(200, '');

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.activationSuccess'].message);

  }]));

  it('should fail on bad register request', inject(['$controller', 'I18N.MESSAGES', '$state', function ($controller, i18nMessages, $state){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    $httpBackend.when('POST', '/api/user/activate').respond(412, {code: 10510});
    $httpBackend.when('GET', '/api/user/current-user').respond('user');
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/register.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/resendActivation.tpl.html').respond(200);
    // $controller('ActivateCtrl', { $scope: $scope});
    $state.transitionTo('register.activate');

    // flush http response and simulate route change
    $httpBackend.flush();
    $rootScope.$broadcast('$stateChangeSuccess', {});

    // test api called
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/register.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/resendActivation.tpl.html');
    $httpBackend.expectPOST('/api/user/activate').respond(401, {code: 10510});

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.activationFail'].message);

  }]));
});
