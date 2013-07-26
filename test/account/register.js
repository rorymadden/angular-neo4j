'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function(done) {
    browser().navigateTo('../app/index.html');
  });


  it('should automatically redirect to /register when user is not authenticated', function() {
    expect(browser().location().url()).toBe("/register");
  });


  xdescribe('register', function() {

    beforeEach(function() {
      browser().navigateTo('/register');
      expect(browser().location().path()).toBe("/register");
    });


    it('should render register form when user navigates to /register', function() {
      // should display benefits
      expect(element('[ng-view] .hero-unit > h1').text()).toMatch("Welcome to awesome App!");
      expect(element('[ng-view] form > input[name*="first"]').text()).toMatch("");
      expect(element('[ng-view] form > input[name*="last"]').text()).toMatch("");
      expect(element('[ng-view] form > input[name*="email"]').text()).toMatch("");
      expect(element('[ng-view] form > input[name*="password"]').text()).toMatch("");
      expect(element('[ng-view] form > select[name*="gender"]').text()).toMatch("");
      expect(element('[ng-view] form > button').text()).toMatch("Sign up - it's free!");
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
    });
    it("should enable submit button if all fields are entered", function(){
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeFalsy();
    });

    it("should keep submit inactive if first is missing", function(){
      // Add your behavior testing code here
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
    });

    it("should keep submit inactive if last is missing", function(){
      // Add your behavior testing code here
      input('user.first').enter('First');
      input('user.email').enter('email@test.com');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
    });

    it("should keep submit inactive if email is missing", function(){
      // Add your behavior testing code here
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
    });

    it("should keep submit inactive if email is incorrect", function(){
      // Add your behavior testing code here
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('bad');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
      // expect(element('[ng-view] span').prop("hidden")).toBeFalsy();
      expect(element('[ng-view] span:visible').text()).toMatch("Please enter a valid email.");
    });

    it("should keep submit inactive if password is missing", function(){
      // Add your behavior testing code here
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
    });

    it("should keep submit inactive if password is short", function(){
      // Add your behavior testing code here
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      input('user.password').enter('pas');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeTruthy();
      // expect(element('[ng-view] span').prop("hidden")).toBeFalsy();
      expect(element('[ng-view] span:visible').text()).toMatch("Password must be a minimum of 6 characters.");
    });

    //TODO: test oauth??

    it("should open a dilaog with terms", function(){
      element('[ng-view] a#terms').click()
      expect(element('.modal-header').text()).toMatch("Terms and Conditions");
      element('body').click()
      expect(element('.modal-header').text()).toMatch("");
    });

    it("should submit when all information entered", function(){
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeFalsy();
      element('[ng-view] form > button').click();
      expect(browser().location().url()).toBe("/login");
      expect(element('.alert-success').text()).toMatch("Registration successful, please check your email for your verification link.");
      element('.alert-success > button').click();
      expect(element('.alert-success')).toBeFalsy();
    });

    it("should error on already registered email", function(){
      input('user.first').enter('First');
      input('user.last').enter('Last');
      input('user.email').enter('email@test.com');
      input('user.password').enter('password');
      select('user.gender').option('male');
      expect(element('[ng-view] form > button').prop("disabled")).toBeFalsy();
      element('[ng-view] form > button').click();
      expect(browser().location().url()).toBe("/register");
      expect(element('.alert-error').text()).toMatch("The email address entered is already registered. Please Login.");
      element('.alert-error > button').click();
      expect(element('.alert-error')).toBeFalsy();
    });

  });

  describe('activate', function() {

    beforeEach(function() {
      browser().navigateTo('/register/bad');
      expect(browser().location().url()).toBe("/register/resendActivation");
    });


    it('should automatically redirect to /resendActivation on a bad activation code', function() {
      expect(element('.alert-error').text()).toMatch("There was an issue with your activation. Please try again.");
    });

    it("should keep submit inactive if email format is incorrect", function(){
      input('user.email').enter('bad');
      expect(element('[ng-view] span:visible').text()).toMatch("Please enter a valid email.");
      expect(element('button#resend').prop("disabled")).toBeTruthy();
    });

    it("should error if email is not registered", function(){
      input('user.email').enter('bad@test.com');
      element('button#resend').click();
      expect(browser().location().url()).toBe("/register/resendActivation");
      expect(element('.alert-error').text()).toMatch("The email address entered is not registered. Please try again.");
    });

    it("should pass if email is registered", function(){
      input('user.email').enter('email@test.com');
      element('button#resend').click();
      pause();
      expect(browser().location().url()).toBe("/login");
      expect(element('.alert-success').text()).toMatch("Activation Key has been successfully resent, please check your email for your verification link.");
    });

    //TODO: how to test true condition (e.g. get real activation code?)
    it("should activate with real activation code", function(){
      browser().navigateTo('/email');
      browser().navigateTo('/register/bad');
      expect(browser().location().url()).toBe("/home");
    });
  });
});