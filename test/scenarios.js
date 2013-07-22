'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function() {
    browser().navigateTo('../app/index.html');
  });


  it('should automatically redirect to /register when user is not authenticated', function() {
    expect(browser().location().url()).toBe("/register");
  });
});