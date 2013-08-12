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
    autoIndexSeries: {type: String, index: true}
  , token: {type: String, index: true }
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


LoginTokenSchema.pre('create', function(next) {
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

// remove a series if one of the items has become compromised
LoginTokenSchema.statics.removeTokenSeries = function(autoIndexSeries, callback) {
  if (!autoIndexSeries) {
    return callback(errorMessages.tokenError, null);
  }
  else {
    // var query = [
    //   'START token=node:node_auto_index(autoIndexSeries={autoIndexSeries})',
    //   'MATCH token-[r]->()',
    //   'DELETE r, token'
    // ].join('\n');
    var query = 'MATCH (n:LoginToken)-[r]-() WHERE n.autoIndexSeries = { autoIndexSeries } DELETE r, n';

    var params = {
      autoIndexSeries: autoIndexSeries
    };

    neoprene.query(query, params, function(err, results) {
      if (err) return callback(err);
      return callback(null);
    });
  }
};

// load the relationship used for this model
// neoprene.model('relationship', 'AUTHORISES', new Schema());

module.exports = neoprene.model('LoginToken', LoginTokenSchema);

