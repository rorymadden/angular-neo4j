'use strict';

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'ui.bootstrap.dialog'     // Used to display the login form as a modal dialog.
])

.factory('security', ['$http', '$q', 'securityRetryQueue', '$dialog', '$state', function ($http, $q, queue, $dialog, $state) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || 'home';
    $state.transitionTo(url);
  }

  // Login form dialog stuff
  var loginDialog;
  var opts = {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      templateUrl:  'scripts/common/security/login/assets/templates/form.tpl.html',
      controller: 'LoginFormController'
    };

  function openLoginDialog() {
    // if (loginDialog && loginDialog.isOpen()) {
    if (loginDialog) {
      throw new Error('Trying to open a dialog that is already open!');
    }

    // new code to test dialog
    // loginDialog = $dialog.dialog(opts);
    loginDialog = $dialog.dialog();
    loginDialog.open('scripts/common/security/login/assets/templates/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
    // loginDialog.open().then(onLoginDialogClose);
  }

  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
    }
  }

  function onLoginDialogClose(success) {
    loginDialog = null;
    if (success) {
      // try delayed first
      queue.retryAll();
      // redirect the user from a
      if($state.current.name.substring(0,8) === 'register' || $state.current.name  === 'login'){
        redirect('home');
      }
    } else {
      // if there is nothing in the queue then this was a voluntary login - ignore
      // if there is something in the queue then cancel the queue and redirect to register page
      if(queue.hasMore()){
        // review usability - might want to redirect to the previous page the user was on instaed of register page
        queue.cancelAll();
        redirect('register.show');
      }
    }
  }


  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function () {
    if (queue.hasMore()) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function () {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function () {
      openLoginDialog();
    },

    // Attempt to authenticate a user by the given email and password
    login: function (email, password, remember_me) {
      var request = $http.post('/api/user/login', {email: email, password: password, remember_me: remember_me});
      return request.then(function (response) {
        service.currentUser = response.data;
        if (service.isAuthenticated()) {
          closeLoginDialog(true);
        }
      });
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function () {
      closeLoginDialog(false);
    },


    // Logout the current user and redirect
    logout: function (redirectTo) {
      $http.post('/api/user/logout').then(function () {
        service.currentUser = null;
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function (options) {
      if (service.isAuthenticated() && !(options && options.force)) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/api/user/current-user').then(function (response) {
          service.currentUser = response.data;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function () {
      return !!service.currentUser;
    },

    // Is the current user an adminstrator?
    isAdmin: function () {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);
