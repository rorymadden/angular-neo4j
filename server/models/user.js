var neoprene = require('neoprene');
var bcrypt = require('bcrypt');
var Schema = neoprene.Schema;
// var events = require('events').EventEmitter;
// var timestamp = require('mongoose-timestamp')

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
  email: { type: String, required: true, lowercase: true, trim: true },
  gender: { type: String, required: true, default: 'unknown', enum: GENDER },
  birthday: { type: Date },

  active:{ type: Boolean, default: false },

  hashed_password: { type: String },
  activationKey: { type: String },
  activationKeyUsed: { type: Boolean, default: false },
  passwordResetKey: { type: String },
  passwordResetDate: { type: Date },
  passwordResetUsed: { type: Boolean },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date },
  accountDeactivated: { type: Boolean, default: false }
});


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
   .set(function (value) {
     this._password = value;
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
      // $set: { "auth.loginAttempts": 1 },
      // $unset: { "auth.lockUntil": 1 }
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


UserSchema.statics.findByEmail = function(email, callback) {
  if(!email) {
    return callback(errorMessages.invalidEmail, null);
  }
  else {
    neoprene.getIndexedNode('node_auto_index', 'email',
      email.toLowerCase().trim(), 'User', function(err, node){
        if(err) return callback(err);
        return callback(null, node);
    });
  }
};

UserSchema.statics.findPassReset = function(id, token, callback) {
  if(!id || typeof(id) === 'function') {
    return callback(errorMessages.invalidPasswordKey, null);
  }
  else {
    neoprene.getIndexedNode('node_auto_index', 'passwordResetKey',
      token, function(err, node){
        if(err) return callback(err);
        if(node.id != id) return callback(errorMessages.invalidPasswordKey);
        return callback(null, node)
    });
  }
};

/**
 * Pre Validate
 */
UserSchema.pre('validate', function (next) {
  var user = this;

  //Hash Password
  // only hash the password if it has been set
  if (!user._password) {
    next();
    return;
  }
  // Encrypt the password with bcrypt
  // Encrypting here, thater than earlier in case other validation fails
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user._password, salt, function(err, hash) {
      if (err) { return next(err); }
      user.hashed_password = hash;
      next();
    });
  });
});


UserSchema.post('activated', function(next){
  //create a new project and relationship between them
  // console.log('post works activated')
  // event.emit('newProject', {user: this});
});

module.exports = neoprene.model('node', 'User', UserSchema);