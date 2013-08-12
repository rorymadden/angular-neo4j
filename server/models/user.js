'use strict';

var neoprene = require('neoprene');
var bcrypt = require('bcrypt');
var Schema = neoprene.Schema;

var env = process.env.NODE_ENV || 'development';
var errorMessages = require('../config/errorMessages')
  , config = require('../config/config')[env];

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);

var GENDER = ['unknown', 'male', 'female'];
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 5 * 60 * 1000;


var UserSchema = new Schema({
  first:{ type: String, required: true, trim: true },
  last:{ type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: {unique: true }},
  gender: { type: String, required: true, default: 'unknown', enum: GENDER },
  birthday: { type: Date },
  active:{ type: Boolean, default: false },

  //sensitive fields
  hashed_password: { type: String },
  activationKey: { type: String, index: true },
  activationKeyUsed: { type: Boolean, default: false },
  passwordResetKey: { type: String, index: true},
  passwordResetDate: { type: Date },
  passwordResetUsed: { type: Boolean },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date },
  accountDeactivated: { type: Boolean, default: false }
});

// overwrite the toJSON method to exclude some of the sensitive fields
UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  obj.hasPassword = obj.hashed_password ? true: false;
  delete obj.hashed_password;
  delete obj.activationKey;
  delete obj.activationKeyUsed;
  delete obj.passwordResetKey;
  delete obj.passwordResetUsed;
  delete obj.passwordResetDate;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.accountDeactivated;
  delete obj.__v;
  return obj;
}

// add some easy access virtuals
UserSchema
  .virtual('name')
  .get(function () {
    return this.first +" "+this.last;
  });

UserSchema
  .virtual('password')
  .get(function () {
    return this.hashed_password;
  })
  .set(function(value) {
    this._doc.hashed_password = value;
  });

UserSchema
  .virtual('isLocked')
  .get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });


/**
 * Instance Methods
 */

UserSchema.methods.createHash = function(password, callback){
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return callback(err); }
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) { return callback(err); }
      // this.hashed_password = hash;
      // console.log(this._doc)
      return callback(null, hash);
    });
  });
};

UserSchema.methods.checkPassword = function (password, callback) {
  bcrypt.compare(password, this.hashed_password, function(err, isMatch){
    if (err) { return callback(err); }
    else { return callback(null, isMatch); }
  });
};

UserSchema.methods.incLoginAttempts = function(callback) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      "loginAttempts": 0,
      "lockUntil": null
    }, callback);
  }
  // otherwise we're incrementing
  var updates = { "loginAttempts": this.loginAttempts + 1 };

  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.lockUntil = Date.now() + LOCK_TIME;
  }
  return this.update(updates, callback);
};

/**
 * Pre Validate
 */
// UserSchema.pre('validate', function (next) {
//   var user = this;

//   //Hash Password
//   // only hash the password if it has been set
//   if (!user._password) {
//     next();
//     return;
//   }
//   // Encrypt the password with bcrypt
//   // Encrypting here, rather than earlier in case other validation fails
//   bcrypt.genSalt(10, function(err, salt) {
//     if (err) { return next(err); }
//     bcrypt.hash(user._password, salt, function(err, hash) {
//       if (err) { return next(err); }
//       user.hashed_password = hash;
//       user._password = null;
//       next();
//     });
//   });
// });


module.exports = neoprene.model('User', UserSchema);