'use strict';

var neoprene = require('neoprene')
  , uuid = require('uuid-v4')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]
  , Schema = neoprene.Schema
  , User = require('./user');

var errorMessages = require('../config/errorMessages');

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);


var OAuthProviderSchema = new Schema({
  profileId: {type: String },
  first: ({type: String}),
  last: ({type: String}),
  middle: ({type: String}),
  email: ({type: String}),
  gender: ({type: String}),
  // password: ({type: String}),
  active: ({type: Boolean}),
  birthday: ({type: String}),
  provider: { type: String },
  locale: {type: String },
  timezone: {type: String },
  picture: {type: String}
}, {strict: false});


OAuthProviderSchema.statics.find = function(provider, id, callback) {
  if(!id || !provider) {
    return callback(errorMessages.tokenError, null);
  }
  else {
    var query = [
      'START oAuth=node:node_auto_index(profileId = {id})',
      'MATCH oAuth-[:OAUTHORISES]->user',
      'WHERE oAuth.provider = {provider}',
      'RETURN user'
    ].join('\n');

    var params = {
      id: id,
      provider: provider
    };

    neoprene.query(query, params, function (err, results) {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, null);
      return callback(null, results[0]['user']);
    });
  }
};


OAuthProviderSchema.statics.getAccounts = function(id, callback){
  if(!id) {
    return callback(errorMessages.oAuthProviderError, null);
  }
  else {
    var query = [
      'START user=node({id})',
      'MATCH oAuth-[:OAUTHORISES]->user',
      'RETURN oAuth'
    ].join('\n');

    var params = {
      id: id
    };

    neoprene.query(query, params, function (err, results) {
      if (err) return callback(err);
      return callback(null, results);
    });
  }
};

OAuthProviderSchema.statics.removeAccount = function(id, callback){
  if(!id) {
    return callback(errorMessages.oAuthProviderError, null);
  }
  else {
    var query = [
      'START linkedAccount=node:node_auto_index(profileId = {id})',
      'MATCH (linkedAccount)<-[r]->()',
      'DELETE r, linkedAccount'
    ].join('\n');

    var params = {
      id: id
    };

    neoprene.query(query, params, function (err) {
      if (err) return callback(err);
      return callback(null);
    });
  }
};

module.exports = neoprene.model('node', 'OAuthProvider', OAuthProviderSchema);
