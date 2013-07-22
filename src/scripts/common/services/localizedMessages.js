'use strict';

angular.module('services.localizedMessages', []).factory('localizedMessages', ['$interpolate', 'I18N.MESSAGES', function ($interpolate, i18nmessages) {

  var handleNotFound = function (msg, msgKey) {
    return msg || '?' + msgKey + '?';
  };

  var i18nMessagesLookup = {};
  for (var key in i18nmessages) {
    i18nMessagesLookup[i18nmessages[key].code] = i18nmessages[key].message;
  }

  return {
    get : function (msgKey, interpolateParams) {
      // var msg =  i18nmessages[msgKey];
      // only displaying first error of multiple server errors
      var msg;
      // lookup by text string
      if(i18nmessages[msgKey]){
        msg =  i18nmessages[msgKey].message;
      }
      // lookup code: server error
      else if(msgKey.code){
        msg =  i18nMessagesLookup[msgKey.code];
      }
      // lookup by multiple server errors - only displaying the first
      // would need to loop over all messages and call calling function
      else if(msgKey[0] && msgKey[0].msg && msgKey[0].msg.code){
        msg = i18nMessagesLookup[msgKey[0].msg.code];
      }

      if (msg) {
        return $interpolate(msg)(interpolateParams);
      } else {
        return handleNotFound(msg, msgKey);
      }
    }
  };
}]);