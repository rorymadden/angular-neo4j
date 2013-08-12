'use strict';

var neoprene = require('neoprene')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]
  , Schema = neoprene.Schema;

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);

// strict false means that other values can be added without needing to be specified
var OAuthProviderSchema = new Schema({
  id: {type: String, index: true},
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


// load the relationship used for this model
// neoprene.model('relationship', 'OAUTHORISES', new Schema());

module.exports = neoprene.model('OAuthProvider', OAuthProviderSchema);
