'use strict';

describe('account tests', function(){


  var $httpBackend, $rootScope, notifications, securityAuthorization, queue, $dialog;
  beforeEach(module('ui.state'));
  beforeEach(module('security.authorization'));
  beforeEach(module('account'));
  beforeEach(module('system.messages'));
  beforeEach(module('security'));
  beforeEach(module('services.notifications'));
  beforeEach(module('services.titleService'));
  beforeEach(module('ui.bootstrap.dialog'));

  function $get(what) {
    return jasmine.getEnv().currentSpec.$injector.get(what);
  }

  beforeEach(module(function ($stateProvider) {
    $stateProvider.state('home', { url: "/" });
  }));

  beforeEach(inject(function($injector, _$dialog_) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    securityAuthorization = $injector.get('securityAuthorization');
    queue = $injector.get('securityRetryQueue');

    // Get hold of a scope (i.e. the root scope)
    $rootScope = $injector.get('$rootScope');
    notifications = $injector.get('notifications');

    // spy on location
    $dialog = _$dialog_;
    var fakeDialog = {
      open: function() {
        return {
          then: function(callback) {
            callback("ok");
          }
        };
      }
    };
    spyOn($dialog, 'messageBox').andReturn(fakeDialog);
  }));

  // //test routes
  it('should test routeProvider: account', inject(['$state', '$q', function ($state, $q) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $httpBackend.when('GET', '/api/user/current-user').respond(200, user);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountShow.tpl.html').respond(200);

    $state.transitionTo('account.show');
    $rootScope.$digest();
    $httpBackend.flush();
    expect($state.current.name).toBe('account.show');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountShow.tpl.html');
  }]));
  it('should test routeProvider: account password', inject(['$state', function ($state) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $httpBackend.when('GET', '/api/user/current-user').respond(200, user);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);

    $state.transitionTo('account.editpassword');
    $rootScope.$digest();
    $httpBackend.flush();
    expect($state.current.name).toBe('account.editpassword');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');
  }]));
  it('should test routeProvider: account linkedAccounts', inject(['$state', function ($state) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    var providers = [{provider: 'facebook', first: 'Face', last: 'Test'}, {provider: 'google', first: 'Goog', last: 'Test'}];
    $httpBackend.when('GET', '/api/account/linkedAccounts').respond(200, providers);
    $httpBackend.when('GET', '/api/user/current-user').respond(200, user);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html').respond(200);

    $state.transitionTo('account.linkedaccounts');
    $rootScope.$digest();
    $httpBackend.flush();
    expect($state.current.name).toBe('account.linkedaccounts');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('/api/account/linkedAccounts');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html');
  }]));
  it('should test routeProvider: account security', inject(['$state', function ($state) {
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    var cookies = [{token: {autoIndexSeries: 'a', token: '1'}}, {token: {autoIndexSeries: 'b', token: '2'}}];
    $httpBackend.when('GET', '/api/account/security').respond(200, cookies);
    $httpBackend.when('GET', '/api/user/current-user').respond(200, user);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountSecurity.tpl.html').respond(200);

    $state.transitionTo('account.security');
    $rootScope.$digest();
    $httpBackend.flush();
    expect($state.current.name).toBe('account.security');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('/api/account/security');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountSecurity.tpl.html');
  }]));


  // // validate that you cannot access the accounts if not logged in
  it('should test routeProvider: account (not logged in)', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    // TODO: why is this still calling account? Fix here or leave until E2E tests?
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountShow.tpl.html').respond(200);

    $state.transitionTo('account.show');
    $rootScope.$digest();
    $httpBackend.flush();

    // the queue is picking up the unauthenticated client so test in E2E
    expect(queue.hasMore()).toBe(true);
    expect(queue.retryReason()).toBe('unauthenticated-client');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountShow.tpl.html');
  }]));

  it('should test routeProvider: account password (not logged in)', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);

    $state.transitionTo('account.editpassword');
    $httpBackend.flush();

    // the queue is picking up the unauthenticated client so test in E2E
    expect(queue.hasMore()).toBe(true);
    expect(queue.retryReason()).toBe('unauthenticated-client');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');
  }]));

  it('should test routeProvider: account linkedAccounts(not logged in)', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', '/api/account/linkedAccounts').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html').respond(200);

    $state.transitionTo('account.linkedaccounts');
    $httpBackend.flush();

    // the queue is picking up the unauthenticated client so test in E2E
    expect(queue.hasMore()).toBe(true);
    expect(queue.retryReason()).toBe('unauthenticated-client');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('/api/account/linkedAccounts');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html');
  }]));

  it('should test routeProvider: account security (not logged in)', inject(['$state', 'security', function ($state, security) {
    security.currentUser = null;
    $httpBackend.when('GET', '/api/user/current-user').respond(null);
    $httpBackend.when('GET', '/api/account/security').respond(null);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountSecurity.tpl.html').respond(200);

    $state.transitionTo('account.security');
    $httpBackend.flush();

    // the queue is picking up the unauthenticated client so test in E2E
    expect(queue.hasMore()).toBe(true);
    expect(queue.retryReason()).toBe('unauthenticated-client');

    // $httpBackEnd
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('/api/account/security');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountSecurity.tpl.html');
  }]));

  it("should set scope when account Ctrl loaded", inject(['$controller', 'security', function($controller, security){
    // Add your behavior testing code here
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    security.currentUser = user;
    $controller('AccountCtrl', { $scope: $scope});
    $rootScope.$digest();

    // verify the initial setup
    expect($scope.user).toEqual(user);
    expect($scope.account).toEqual(user);
  }]));


  it('should access account page and submit edit', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    // TODO: these should be set by the account Ctrl
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('GET', '/api/user/current-user').respond(user);
    $httpBackend.when('PUT', '/api/account').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountShow.tpl.html').respond(200);
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
    $scope.update();

    // flush http response and simulate route change
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/account').respond(200, '');
    // get current user is forced due to the update
    $httpBackend.expectGET('/api/user/current-user');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountShow.tpl.html');

    // test password set to null
    expect($scope.account.password).toEqual(null);
    expect($scope.editable).toBe(false);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.account.updated'].message);

  }]));

  it('should fail on bad edit request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    // set up controller with a scope
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('PUT', '/api/account').respond(412, {code: 10510});
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountShow.tpl.html').respond(200);
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
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountShow.tpl.html');

    // test password set to null
    expect($scope.account.password).toEqual(null);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['generic.error'].message);
  }]));

  it('should update account password', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('PUT', '/api/account/editPassword').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);


    $controller('AccountPasswordCtrl', { $scope: $scope});

    $scope.password = { currentPassword: 'password', newPassword: 'new', passwordConfirm: 'new'};
    $scope.update();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/user/editPassword').respond(200, '');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');

    //test user set to null
    expect($scope.password).toEqual(null);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordChangeSuccess'].message);
  }]));

  it('should fail on bad resend Password Update request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('PUT', '/api/account/editPassword').respond(412, {code: 20210});
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);

    $controller('AccountPasswordCtrl', { $scope: $scope});

    $scope.password = { currentPassword: 'password', newPassword: 'new', passwordConfirm: 'new'};
    $scope.update();
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPUT('/api/account/editPassword').respond(412, {code: 20210});
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');

    //test user set to null
    expect($scope.password).toEqual(null);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should resend Password Link', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('POST', '/api/user/forgotPassword').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);

    $controller('AccountPasswordCtrl', { $scope: $scope});

    expect($scope.sent).toEqual(false);
    $scope.sendPasswordLink('testuser@test.com');
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(200, '');
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');

    //test user set to null
    expect($scope.sent).toEqual(true);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should fail on bad resend Password Link request', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    $httpBackend.when('POST', '/api/user/forgotPassword').respond(412, {code: 20210});
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountPassword.tpl.html').respond(200);

    $controller('AccountPasswordCtrl', { $scope: $scope});

    expect($scope.sent).toEqual(false);
    $scope.sendPasswordLink('testuser@test.com');
    $httpBackend.flush();

    // test api called
    $httpBackend.expectPOST('/api/user/forgotPassword').respond(412, {code: 20210});
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountPassword.tpl.html');

    //test user set to null
    expect($scope.sent).toEqual(false);

    // test notification correct
    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.password.passwordResetLinkSent'].message);
  }]));

  it('should get linked accounts', inject(['$controller', function ($controller){
    // mock the accountCtrl
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    // tested the linkedAccounts call in the state test above
    var providers = {data: [{provider: 'facebook', first: 'Face', last: 'Test'}, {provider: 'google', first: 'Goog', last: 'Test'}]};

    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html').respond(200);
    $controller('AccountLinkedCtrl', { $scope: $scope, linkedAccounts: providers});

    // $httpBackend.flush();

    expect($scope.facebook.first).toEqual('Face');
    expect($scope.google.first).toEqual('Goog');

    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html');
  }]));

  it('should remove linked accounts', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){

    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    // tested the linkedAccounts call in the state test above
    var providers = {data: [{provider: 'facebook', first: 'Face', last: 'Test'}, {provider: 'google', first: 'Goog', last: 'Test'}]};

    $httpBackend.when('GET', 'template/dialog/message.html').respond(true);
    $httpBackend.when('DELETE', '/api/account/linkedAccounts/1234').respond(200);
    $controller('AccountLinkedCtrl', { $scope: $scope, linkedAccounts: providers});


    $scope.removeLinkedAccount('facebook', '1234');

    $httpBackend.flush();
    $httpBackend.expectDELETE('/api/account/linkedAccounts/1234').respond(200);
    $rootScope.$digest();
    expect($scope.facebook).toBe(null);

    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(0);
  }]));

  it('should fail on remove linked accounts - bad', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){

    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    // tested the linkedAccounts call in the state test above
    var providers = {data: [{provider: 'facebook', first: 'Face', last: 'Test'}, {provider: 'google', first: 'Goog', last: 'Test'}]};

    $httpBackend.when('GET', 'template/dialog/message.html').respond(true);
    $httpBackend.when('DELETE', '/api/account/linkedAccounts/5432').respond(412, {code:20150});
    $controller('AccountLinkedCtrl', { $scope: $scope, linkedAccounts: providers});


    $scope.removeLinkedAccount('google', '5432');

    $httpBackend.flush();
    $httpBackend.expectDELETE('/api/account/linkedAccounts/5432').respond(412, {code:20150});
    $rootScope.$digest();
    expect($scope.google).not.toBe(null);

    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

  it('should get Account Tokens', inject(['$controller', function ($controller){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    var cookies = {data: [{token: {autoIndexSeries: 'a', token: '1'}}, {token: {autoIndexSeries: 'b', token: '2'}}]};
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html').respond(200);
    $controller('AccountGetLoginTokensCtrl', { $scope: $scope, cookies: cookies});

    expect($scope.cookies).toEqual(cookies.data);
    expect($scope.cookies.length).toEqual(2);

    // test api called
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountLinkedAccounts.tpl.html');

  }]));


  it('should delete Account Tokens', inject(['$controller', 'I18N.MESSAGES', function ($controller, i18nMessages){
    var $scope = $rootScope.$new();
    var user = { first: 'First', last: 'Last', email: 'testuser@test.com', gender:'male', birthday:'password'};
    $scope.account = $scope.user = user;

    var cookies = {data: [{autoIndexSeries: 'a', token: '1', _id:'1234'}, {autoIndexSeries: 'b', token: '2', _id: '5432'}]};

    $httpBackend.when('DELETE', '/api/account/security/1234').respond(200);
    $httpBackend.when('DELETE', '/api/account/security/5432').respond(412, {code:20150});
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/account.tpl.html').respond(200);
    $httpBackend.when('GET', 'scripts/common/account/assets/templates/accountSecurity.tpl.html').respond(200);
    $controller('AccountGetLoginTokensCtrl', { $scope: $scope, cookies: cookies});


    $scope.removeToken('1234');
    $scope.removeToken('5432');

    $httpBackend.flush();

    $httpBackend.expectDELETE('/api/account/security/1234').respond(200);
    $httpBackend.expectDELETE('/api/account/security/5432').respond(412, {code:20150});
    $httpBackend.expectGET('scripts/common/account/assets/templates/account.tpl.html');
    $httpBackend.expectGET('scripts/common/account/assets/templates/accountSecurity.tpl.html');
    expect($scope.cookies.length).toBe(1);

    var notes = notifications.getCurrent();
    expect(notes.length).toEqual(1);
    expect(notes[0].message).toEqual(i18nMessages['common.register.userRegisteredAndActive'].message);
  }]));

});
