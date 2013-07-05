'use strict';

describe('account tests', function(){

  var $httpBackend, $rootScope, createController, notifications, windowSpy, securityAuthorization;
  beforeEach(module('security.authorization'));
  beforeEach(module('services.notifications'));
  beforeEach(module('system.messages'));
  beforeEach(module('services.titleService'));
  beforeEach(module('security'));
  beforeEach(module('account'));

  // routes - test in e2e tests
  // beforeEach(module('scripts/common/account/assets/templates/account.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/register.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/forgotPassword.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/resendActivation.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/changeForgottenPassword.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/accountPassword.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/accountSecurity.tpl.html'));
  // beforeEach(module('scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html'));
  beforeEach(inject(function($injector) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    securityAuthorization = $injector.get('securityAuthorization');
    // backend definition common for all tests


    // Get hold of a scope (i.e. the root scope)
    $rootScope = $injector.get('$rootScope');
    notifications = $injector.get('notifications');
    // messages = $injector.get('system.messages');
  }));


  it('should access account page and submit edit', inject(['$controller', 'I18N.MESSAGES', 'security', function ($controller, i18nMessages, security){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $httpBackend.when('GET', '/api/user/current-user').respond(user);
    $httpBackend.when('PUT', '/api/account').respond(200);
    // $httpBackend.expectGET('/api/user/current-user');
    $controller('AccountViewCtrl', { $scope: $scope});

    $rootScope.$digest();
    // verify the initial setup
    expect($scope.genders.length).toEqual(2);
    expect($scope.user).toEqual(user);
    expect($scope.account).toEqual(user);
    expect($scope.editable).toBe(false);
    expect($scope.editCheck()).toBe(false);


    // make editable
    $scope.edit();
    expect($scope.editable).toBe(true);
    expect($scope.editCheck()).toBe(true);
    $scope.account.password = 'password';

    $httpBackend.expectGET('/api/user/current-user');
    $scope.update();
    // flush http response and simulate route change
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/account').respond(200, '');
    //test user set to null
    expect($scope.account.password).toEqual(null);
    expect($scope.editable).toBe(false);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.account.updated'].message);

  }]));

  it('should fail on bad edit request', inject(['$controller', 'I18N.MESSAGES', 'security', function ($controller, i18nMessages, security){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $httpBackend.when('GET', '/api/user/current-user').respond(user);
    $httpBackend.when('PUT', '/api/account').respond(412, {code: 10510});
    // $httpBackend.expectGET('/api/user/current-user');
    $controller('AccountViewCtrl', { $scope: $scope});

    $rootScope.$digest();
    // make editable
    $scope.edit();
    expect($scope.editable).toBe(true);
    expect($scope.editCheck()).toBe(true);
    expect($scope.account).toEqual(user);
    $scope.account.password = 'password';

    $scope.update();
    // flush http response and simulate route change
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/account').respond(412, {code: 10510});
    //test user set to null
    expect($scope.account.password).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['generic.error'].message);
  }]));

  it('should get linked accounts', inject(['$controller', function ($controller){
    var $scope = $rootScope.$new();
    var providers = [{oAuth: {provider: 'facebook', first: 'Face', last: 'Test'}}, {oAuth: {provider: 'google', first: 'Goog', last: 'Test'}}];
    $httpBackend.when('GET', '/api/account/linkedAccounts').respond(200, providers);
    $controller('AccountLinkedCtrl', { $scope: $scope});

    $httpBackend.flush();
    $httpBackend.expectGET('/api/account/linkedAccounts').respond(200, providers);
    // $rootScope.$broadcast('$routeChangeSuccess', {});

    // test api called
    //test user set to null
    expect($scope.facebook.first).toEqual('Face');
    expect($scope.google.first).toEqual('Goog');

  }]));
  // Test in end to end testing
  // it('should get oAuth values', inject(['$controller', function ($controller){
  //   var $scope = $rootScope.$new();
  //   var providers = [{oAuth: {provider: 'facebook', first: 'Face', last: 'Test'}}, {oAuth: {provider: 'google', first: 'Goog', last: 'Test'}}];
  //   $httpBackend.when('GET', '/api/account/linkedAccounts').respond(200, providers);
  //   $controller('AccountLinkedCtrl', { $scope: $scope});

  //   $httpBackend.flush();
  //   $httpBackend.expectGET('/api/account/linkedAccounts').respond(200, providers);

  //   expect(windowSpy.location.href).toHaveBeenCalled();

  // }]));
  it('should remove linked accounts', inject(['$controller', function ($controller){
    var $scope = $rootScope.$new();
    var providers = [{oAuth: {provider: 'facebook', first: 'Face', last: 'Test', profileId: '1'}}, {oAuth: {provider: 'google', first: 'Goog', last: 'Test', profileId: '2'}}];
    $httpBackend.when('GET', '/api/account/linkedAccounts').respond(200, providers);
    $httpBackend.when('GET', 'template/dialog/message.html').respond(true);
    $httpBackend.when('DELETE', '/api/account/linkedAccounts/1').respond(200);
    $httpBackend.when('DELETE', '/api/account/linkedAccounts/2').respond(412, {code:20150});
    $controller('AccountLinkedCtrl', { $scope: $scope});

    $scope.removeLinkedAccount('facebook', '1');
    $scope.removeLinkedAccount('google', '2');
    // TODO: need to trigger the ok press in message box. Otherwise not called
    $httpBackend.flush();
    $httpBackend.expectDELETE('/api/account/linkedAccounts/1').respond(200);
    $httpBackend.expectDELETE('/api/account/linkedAccounts/2').respond(412, {code:20150});
    $rootScope.$digest();
    expect($scope.facebook).toBe(null);

    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

  it('should show message on linked account failure', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $httpBackend.when('GET', '/api/account/linkedAccounts').respond(412, {code: 20150});
    $controller('AccountLinkedCtrl', { $scope: $scope});

    // var user = { email: 'testuser@test.com'};
    // $scope.user = user;
    // $scope.resendActivation();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectGET('/api/account/linkedAccounts').respond(412, {code: 20150});
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

  it('should update account password', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('AccountPasswordCtrl', { $scope: $scope});
    $httpBackend.when('PUT', '/api/account/editPassword').respond(200);

    $scope.password = { currentPassword: 'password', newPassword: 'new', passwordConfirm: 'new'};
    $scope.update();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/user/editPassword').respond(200, '');
    //test user set to null
    expect($scope.password).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordChangeSuccess'].message);
  }]));

  it('should fail on bad resend Password Update request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('AccountPasswordCtrl', { $scope: $scope});
    $httpBackend.when('PUT', '/api/account/editPassword').respond(412, {code: 20210});

    $scope.password = { currentPassword: 'password', newPassword: 'new', passwordConfirm: 'new'};
    $scope.update();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/account/editPassword').respond(412, {code: 20210});
    //test user set to null
    expect($scope.password).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should resend Password Link', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('AccountPasswordCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/forgotPassword').respond(200);

    expect($scope.sent).toEqual(false);
    $scope.sendPasswordLink('testuser@test.com');
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(200, '');
    //test user set to null
    expect($scope.sent).toEqual(true);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should fail on bad resend Password Link request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    $controller('AccountPasswordCtrl', { $scope: $scope});
    $httpBackend.when('POST', '/api/user/forgotPassword').respond(412, {code: 20210});

    expect($scope.sent).toEqual(false);
    $scope.sendPasswordLink('testuser@test.com');
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(412, {code: 20210});
    //test user set to null
    expect($scope.sent).toEqual(false);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should get Account Tokens', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var cookies = [{token: {autoIndexSeries: 'a', token: '1'}}, {token: {autoIndexSeries: 'b', token: '2'}}];
    $httpBackend.when('GET', '/api/account/security').respond(200, cookies);
    $controller('AccountGetLoginTokensCtrl', { $scope: $scope});

    $httpBackend.flush();

    // test api called
    $httpBackend.expectGET('/api/account/security').respond(200, cookies);

    expect($scope.cookies).toEqual(cookies);
    expect($scope.cookies.length).toEqual(2);
  }]));

  it('should fail on Account tokens error', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var cookies = [{token: {autoIndexSeries: 'a', token: '1'}}, {token: {autoIndexSeries: 'b', token: '2'}}];
    $httpBackend.when('GET', '/api/account/security').respond(412, {code: 20510});
    $controller('AccountGetLoginTokensCtrl', { $scope: $scope});

    $httpBackend.flush();

    // test api called
    $httpBackend.expectGET('/api/account/security').respond(412, {code: 20510});

    expect($scope.cookies).toEqual(null);
    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.usedPasswordKey'].message);
  }]));

  it('should delete Account Tokens', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var cookies = [{token: {autoIndexSeries: 'a', token: '1'}}, {token: {autoIndexSeries: 'b', token: '2'}}];
    $httpBackend.when('GET', '/api/account/security').respond(200, cookies);
    $httpBackend.when('DELETE', '/api/account/security/a/1').respond(200);
    $httpBackend.when('DELETE', '/api/account/security/b/2').respond(412, {code:20150});
    $controller('AccountGetLoginTokensCtrl', { $scope: $scope});

    $scope.removeToken('a', '1');
    $scope.removeToken('b', '2');
    $httpBackend.flush();
    $httpBackend.expectDELETE('/api/account/security/a/1').respond(200);
    $httpBackend.expectDELETE('/api/account/security/b/2').respond(412, {code:20150});
    $rootScope.$digest();
    expect($scope.cookies.length).toBe(1);

    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

  // //test routes
  // it('should test routeProvider', function() {
  //   var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
  //   $httpBackend.when('GET', '/api/user/current-user').respond(200, user);
  //   inject(function($route, $location, $rootScope) {

  //     expect($route.current).toBeUndefined();
  //     $location.path('/register');
  //     $rootScope.$digest();


  //     expect($route.current.templateUrl).toBe('scripts/common/account/assets/templates/register.tpl.html');
  //     expect($route.current.controller).toBe('RegisterCtrl');

  //     $location.path('/activate/blue');
  //     $rootScope.$digest();

  //     expect($location.path()).toBe('/activate/blue');
  //     expect($route.current.templateUrl).toEqual('scripts/common/account/assets/templates/register.tpl.html');
  //     expect($route.current.controller).toBe('ActivateCtrl');

  //     // $httpBackEn
  //     $httpBackend.expectGET('/api/user/current-user').respond(200, user);
  //   });
  // });

});
