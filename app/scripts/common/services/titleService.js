'use strict';

angular.module('services.titleService', [])

.factory('titleService', function ($document) {
  var suffix, prefix, title;

  var titleService = {
    setSuffix: function setSuffix (s) {
      suffix = s;
    },
    getSuffix: function getSuffix () {
      return suffix;
    },
    setPrefix: function setPrefix (s) {
      prefix = s;
    },
    getPrefix: function getPrefix () {
      return prefix;
    },
    setTitle: function setTitle (t) {
      if ( angular.isDefined(suffix) ) {
        title = t + suffix;
      } else if ( angular.isDefined(prefix) ) {
        title = prefix + t;
      } else {
        title = t;
      }

      $document.prop('title', title);
    },
    getTitle: function getTitle () {
      return $document.prop('title');
    }
  };

  return titleService;
});