
'use strict';

angular.module('rorymadden.date-dropdowns', [])

.directive('rsmdatedropdowns', [function(){
  return {
    restrict: 'A',
    replace: true,
    require: 'ngModel',
    scope: {
      model: '=ngModel'
    },
    controller: function($scope) {
      // set up arrays of values
      $scope.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
      $scope.months = [
        { value: 0, name: 'January' },
        { value: 1, name: 'February' },
        { value: 2, name: 'March' },
        { value: 3, name: 'April' },
        { value: 4, name: 'May' },
        { value: 5, name: 'June' },
        { value: 6, name: 'July' },
        { value: 7, name: 'August' },
        { value: 8, name: 'September' },
        { value: 9, name: 'October' },
        { value: 10, name: 'November' },
        { value: 11, name: 'December' }
      ];
      var currentYear = new Date().getFullYear();
      var oldestYear = currentYear - 100;
      $scope.years = [];
      for(var i = currentYear; i >= oldestYear; i-- ){
        $scope.years.push(i);
      }
      // split the current date into sections
      $scope.dateFields = {};

      // get UTC version of the date - use case is a birthday as datepickers do not work well for birthdays
      // if timezones are important raise a pull request and include the use case.
      $scope.$watch('model', function ( newDate, oldDate ) {
        $scope.dateFields.day = new Date(newDate).getUTCDate();
        $scope.dateFields.month = new Date(newDate).getUTCMonth();
        $scope.dateFields.year = new Date(newDate).getUTCFullYear();
      });

      // validate that the date selected is accurate
      $scope.checkDate = function(){
        // don't check the validity of the date if any of the fields are blank
        if(!$scope.dateFields.day || !$scope.dateFields.month || !$scope.dateFields.year){
          return false;
        }
        if(validateDate($scope.dateFields)) {
          // update the model when the date is correct
          $scope.model = new Date(Date.UTC($scope.dateFields.year, $scope.dateFields.month, $scope.dateFields.day));
          return true;
        }
        else {
          // change the date on the scope and try again if invalid
          $scope.dateFields = changeDate($scope.dateFields);
          this.checkDate();
        }
      };

      // validate if entered values are a real date
      function validateDate(date){
        // store as a UTC date as we do not want changes with timezones
        var d = new Date(Date.UTC(date.year, date.month, date.day));
        return d && (d.getMonth() === date.month && d.getDate() === Number(date.day));
      }

      // reduce the day count if not a valid date (e.g. 30 february)
      function changeDate(date){
        if(date.day > 28) {
          date.day--;
          return date;
        }
        // this case should not exist with a restricted input
        // if a month larger than 11 is entered
        else if (date.month > 11) {
          date.day = 31;
          date.month--;
          return date;
        }
      }
    },
    template:
      '<div>' +
      '  <select name="dateFields.day" data-ng-model="dateFields.day" class="span1" ng-options="day for day in days" ng-change="checkDate()" ng-disabled="disableFields"></select>' +
      '  <select name="dateFields.month" data-ng-model="dateFields.month" class="span2" ng-options="month.value as month.name for month in months" value="{{dateField.month}}" ng-change="checkDate()" ng-disabled="disableFields"></select>' +
      '  <select name="dateFields.year" data-ng-model="dateFields.year" class="span1" ng-options="year for year in years" ng-change="checkDate()" ng-disabled="disableFields"></select>' +
      '</div>',
    link: function(scope, element, attrs, ctrl){
      scope.$parent.$watch(attrs.ngDisabled, function(newVal){
        scope.disableFields = newVal;
      });

      // TODO: Need to set form as invalid if only one or two fields populated
      // ctrl.$parsers.unshift(function(value) {
      //   console.log('called');

      //   // test and set the validity after update.
      //   var valid = (scope.dateFields.day && scope.dateFields.month && scope.dateFields.year);
      //   ctrl.$setValidity('dateFields', valid);

      //   // if it's valid, return the value to the model,
      //   // otherwise return undefined.
      //   return valid ? value : undefined;
      // });
    }
  };
}]);