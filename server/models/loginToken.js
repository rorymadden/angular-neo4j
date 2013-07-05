var neoprene = require('neoprene')
  , Schema = neoprene.Schema
  , uuid = require('uuid-v4')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env];

var errorMessages = require('../config/errorMessages');

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);

var LoginTokenSchema = new Schema({
    autoIndexSeries: {type: String }
  , token: {type: String }
  , ip: { type: String }
  , country: { type: String }
  , city: { type: String }
  , browser: { type: String }
  , os: { type: String }
  , created: { type: Date }
  , userAgent: {}
  , location: {}
});

LoginTokenSchema
  .virtual('cookieValue')
  .get(function() {
    return JSON.stringify(
      { autoIndexSeries: this.autoIndexSeries, token: this.token});
  });


LoginTokenSchema.pre('save', function(next) {
  // Automatically create the token
  this.token = uuid();
  this.created = new Date();
  next();
});

// get the value of the loginToken for setting in the cookie
LoginTokenSchema.methods.getCookieValue = function(){
  return JSON.stringify(
      { autoIndexSeries: this.autoIndexSeries, token: this.token});
};

LoginTokenSchema.statics.getTokens = function(email, callback) {
  if (!email) {
    return callback(errorMessages.invalidEmail, null);
  }
  else {
    var query = [
      'START user=node:node_auto_index(email = {email})',
      'MATCH token-[:AUTHORISES]->user',
      'RETURN token'
    ].join('\n');

    var params = {
      email: email
    };

    neoprene.query(query, params, function(err, results) {
      if (err) return callback(err);
      return callback(err, results);
    });
  }
};

LoginTokenSchema.statics.getToken = function(cookie, callback) {
  if (!cookie.token || !cookie.autoIndexSeries) {
    return callback(errorMessages.tokenError, null);
  }
  else {
    var query = [
      'START token=node:node_auto_index(autoIndexSeries= {autoIndexSeries})',
      'MATCH token-[:AUTHORISES]->user',
      'WHERE token.token = {token}',
      'RETURN user, token'
    ].join('\n');

    var params = {
      autoIndexSeries: cookie.autoIndexSeries,
      token: cookie.token
    };

    neoprene.query(query, params, function(err, results) {
      if (err) return callback(err);
      if(results[0]) return callback(err, results[0]['user'], results[0]['token']);
    });
  }
};

LoginTokenSchema.statics.removeTokenSeries = function(autoIndexSeries, callback) {
  if (!autoIndexSeries) {
    return callback(errorMessages.tokenError, null);
  }
  else {
    var query = [
      'START token=node:node_auto_index(autoIndexSeries={autoIndexSeries})',
      'DELETE token'
    ].join('\n');

    var params = {
      autoIndexSeries: autoIndexSeries
    };

    neoprene.query(query, params, function(err, results) {
      if (err) return callback(err);
      return callback(null);
    });
  }
};


LoginTokenSchema.statics.removeToken = function(loginToken, callback){
  if(!loginToken.autoIndexSeries || !loginToken.token){
    return callback(errorMessages.tokenError)
  }
  else {
    var query = [
      'START tokens=node:node_auto_index(autoIndexSeries={autoIndexSeries})',
      'MATCH tokens-[r]->()',
      'WHERE tokens.token = {token}',
      'DELETE tokens, r'
    ].join('\n');

    var params = {
      autoIndexSeries: loginToken.autoIndexSeries,
      token: loginToken.token
    };


    neoprene.query(query, params, function(err, results) {
      if (err) return callback(err);
      return callback(null);
    });
  }
};
module.exports = neoprene.model('node', 'LoginToken', LoginTokenSchema);

