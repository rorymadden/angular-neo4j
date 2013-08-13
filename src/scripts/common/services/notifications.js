'use strict';

angular.module('services.notifications', []).factory('notifications', ['$rootScope', function ($rootScope) {

  var notifications = {
    'STICKY' : [],
    'ROUTE_CURRENT' : [],
    'ROUTE_NEXT' : []
  };
  var notificationsService = {};

  var addNotification = function (notificationsArray, notificationObj) {
    if (!angular.isObject(notificationObj)) {
      throw new Error('Only object can be added to the notification service');
    }
    console.log(notificationObj)
    notificationsArray.push(notificationObj);
    return notificationObj;
  };

  $rootScope.$on('$stateChangeSuccess', function () {
  // $rootScope.$on('$routeChangeSuccess', function () {
    notifications.ROUTE_CURRENT.length = 0;

    notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
    notifications.ROUTE_NEXT.length = 0;
  });

  notificationsService.getCurrent = function () {
    return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
  };

  notificationsService.pushSticky = function (notification) {
    return addNotification(notifications.STICKY, notification);
  };

  notificationsService.pushForCurrentRoute = function (notification) {
    return addNotification(notifications.ROUTE_CURRENT, notification);
  };

  notificationsService.pushForNextRoute = function (notification) {
    return addNotification(notifications.ROUTE_NEXT, notification);
  };

  notificationsService.remove = function (notification) {
    angular.forEach(notifications, function (notificationsByType) {
      var idx = notificationsByType.indexOf(notification);
      if (idx > -1) {
        notificationsByType.splice(idx, 1);
      }
    });
  };

  notificationsService.removeAll = function () {
    // console.log('called')
    angular.forEach(notifications, function (notificationsByType) {
      notificationsByType.length = 0;
    });
  };

  notificationsService.getAll = function () {
    return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT, notifications.ROUTE_NEXT);
  };

  return notificationsService;
}]);