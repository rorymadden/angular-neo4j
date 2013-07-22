'use strict';

var fs = require('fs');

/**
 * Reads disposable email file and validates email
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.disposableEmail = function(email, callback){
  var badEmailsTxt = 'config/disposableEmailProviders.txt';

  var badEmails = [];
  var emailParts=email.split("@");
  var array = fs.readFileSync(badEmailsTxt).toString().split("\n");
  var disposable = true;
  for(var i in array) {
    if(array[i].charAt(0) && array[i].charAt(0) !== '#'){
      badEmails.push(array[i]);
    }
  }
  if(badEmails.indexOf(emailParts[1]) < 0 ) {
    disposable = false;
  }
  return callback(null, disposable);
};
