describe('login-toolbar', function() {
  var $rootScope, scope, toolbar, security;
  beforeEach(module('scripts/common/security/login/assets/templates/toolbar.tpl.html', 'security'));
  // beforeEach(inject(function(_$rootScope_, $compile, _security_) {
  //   $rootScope = _$rootScope_;
  //   security = _security_;
  //   toolbar = $compile('<login-toolbar></login-toolbar')($rootScope);
  //   $rootScope.$digest();
  //   scope = toolbar.scope();
  //   angular.element(document.body).append(toolbar);
  // }));
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    security = $injector.get('security');
    var $compile = $injector.get('$compile');
    toolbar = angular.element('<login-toolbar></login-toolbar>')
    var other = $compile(toolbar)($rootScope);
    $rootScope.$digest();
    scope = other.scope();

    // console.log('toolbar '+JSON.stringify(scope));
    angular.element(document.body).append(toolbar);
  }));

  afterEach(function() {
    toolbar.remove();
  });

  it('should attach stuff to the scope', function() {
    expect(scope.currentUser).toBeDefined();
    expect(scope.isAuthenticated).toBe(security.isAuthenticated);
    expect(scope.login).toBe(security.showLogin);
    expect(scope.logout).toBe(security.logout);
  });

  it('should display a link with the current user name, when authenticated', function () {
    security.currentUser = { first: 'Jo', last: 'Bloggs'};
    $rootScope.$digest();

    expect(document.getElementById('accountMenu').textContent).toBe('Jo Bloggs');
  });

  it('should not display a link with the current user name, when not authenticated', function () {
    security.currentUser = null;
    $rootScope.$digest();
    var element = document.getElementById('accountMenu')
    var isVisible = element.offsetWidth > 0 || element.offsetHeight > 0;
    expect(isVisible).toBe(false);
    // expect(toolbar.find('a.dropdown-toggle').is(':visible')).toBe(false);
  });

  it('should display login when user is not authenticated', function() {
    var buttons = document.getElementsByTagName("button");
    for(var i=0;i<buttons.length; i++){
      if(buttons[i].offsetWidth > 0 || buttons[i].offsetHeight > 0) {
        expect(buttons[i].textContent).toBe('Log in');
      }
      else expect(buttons[i].textContent).toBe('Log out');
    }
    // expect(toolbar.find('button:visible').text()).toBe('Log in');
    // expect(toolbar.find('button:hidden').text()).toBe('Log out');
  });

  it('should display logout when user is authenticated', function() {
    security.currentUser = {};
    $rootScope.$digest();

    var buttons = document.getElementsByTagName("button");
    for(var i=0;i<buttons.length; i++){
      if(buttons[i].offsetWidth > 0 || buttons[i].offsetHeight > 0) {
        expect(buttons[i].textContent).toBe('Log out');
      }
      else expect(buttons[i].textContent).toBe('Log in');
    }
    // expect(toolbar.find('button:visible').text()).toBe('Log out');
    // expect(toolbar.find('button:hidden').text()).toBe('Log in');
  });

  it('should call logout when the logout button is clicked', function () {
    spyOn(scope, 'logout');
    // var buttons = document.getElementsByClassName('logout');
    // console.log(buttons[0].textContent);
    // angular.element(buttons[0]).click();
    // buttons[0].click();
    toolbar.find('button.logout').click();
    expect(scope.logout).toHaveBeenCalled();
  });

  it('should call login when the login button is clicked', function () {
    spyOn(scope, 'login');
    // var buttons = document.getElementsByClassName('login');
    // buttons[0].click();
    toolbar.find('button.login').click();
    expect(scope.login).toHaveBeenCalled();
  });
});