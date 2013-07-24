'use strict';

angular.module('services.breadcrumbs', []);
angular.module('services.breadcrumbs').factory('breadcrumbs', ['$rootScope', '$state', function ($rootScope, $state) {

  var breadcrumbs = [];
  var breadcrumbsService = {};
  var elements = [];

  //we want to update breadcrumbs only when a route is actually changed
  //as $location.path() will get updated imediatelly (even if route change fails!)
  $rootScope.$on('$stateChangeSuccess', function () {
    var result =[];
    elements = $state.current.name.split('.');

    if(elements[elements.length-1] === 'show') elements.pop();

    var breadcrumbPath = function (index) {
      return '/' + (elements.slice(0, index + 1)).join('/');
    };

    for (var i = 0; i < elements.length; i++) {
      result.push({name: elements[i], path: breadcrumbPath(i)});
    }

    breadcrumbs = result;
  });

  breadcrumbsService.getParentRoute = function () {
    return elements[0] || {};
  };

  breadcrumbsService.getAll = function () {
    return breadcrumbs;
  };

  return breadcrumbsService;
}]);