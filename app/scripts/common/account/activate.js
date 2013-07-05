angular.module('account.activate', ['services.i18nNotifications'])

.controller('ActivateCtrl', ['$scope', '$http', '$routeParams', '$location', 'i18nNotifications', function ($scope, $http, $params, $location, i18nNotifications) {
  $http.post('/api/user/activate', { activationKey: $params.activationKey})
    .success(function(){
      i18nNotifications.pushForNextRoute('common.register.activationSuccess', 'success', {}, {});
      $location.path('/home');
    })
    .error(function(data, status, headers, config) {
      i18nNotifications.pushForNextRoute('common.register.activationFail', 'error', {}, {});
      $location.path('/resendActivation');
    });
}]);