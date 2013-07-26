'use strict';

var express = require('express');
var http = require('http');
var app = express();
// var neoprene = require('neoprene')
var RedisStore = require('connect-redis')(express);
var expressValidator = require('express-validator');
var passport = require('passport');
var mailerService = require('./controllers/mailerService');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
// var loggerStream = require('./').loggerStream;
// var logger = require('./').logger;
// var airbrake = require('airbrake').createClient(config.airbrake.apiKey)
// var errors = require('./').errors

// bootstrap passport config
require('./lib/passport').boot(passport, config);

var app = module.exports = app;

app.configure(function() {
  app.set('port', config.node.port);
  app.use(express.favicon());

  if (app.get('env') === 'development') {
    app.use(express.logger('dev'));
  }
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(expressValidator);
  app.use(express.cookieParser(config.cookie.secret));

  // Configure session to use Redis as store
  app.use(express.session({
    key: 'express.sid',
    secret: config.sess.secret,
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      pass: config.redis.pass,
      ttl: config.redis.ttl
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  //csrf protection
  // add a check for the csrf token in the req.headers['x-xsrf-token'] - angular places it here
  // all other checks are the default express behaviour
  if(env !== 'test') {
    var csrfValue = function(req) {
      var token = (req.body && req.body._csrf)
        || (req.query && req.query._csrf)
        || (req.headers['x-csrf-token'])
        || (req.headers['x-xsrf-token']);
      return token;
    };
    app.use(express.csrf({value: csrfValue}));
    // put the csrf token from the header into the cookie for angular to pickup
    app.use(function(req, res, next) {
      res.cookie('XSRF-TOKEN', req.session._csrf);
      next();
    });
  }


  app.use(express.compress());

  // staticCache has been deprecated.
  // TODO: investigate varnish / nginx for caching
  // app.use(express.staticCache());


  // host dev files if in dev mode
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    app.use(express.static(__dirname + '/../.tmp'));
    app.use(express.static(__dirname + '/../src'));
  } else {
    app.use(express.static(__dirname + '/../dist'),  {maxAge: 86400000});
  }

  // Need to be careful for similar filenames in router as
  // static files will be loaded first
  app.use(app.router);

  // Since this is the last non-error-handling
  // middleware use()d, we assume 404, as nothing else
  // responded.

  // $ curl http://localhost:3000/notfound
  // $ curl http://localhost:3000/notfound -H "Accept: application/json"
  // $ curl http://localhost:3000/notfound -H "Accept: text/plain"
  app.use(function(req, res, next) {
    res.status(404);

    // Respond with html page:
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }
    // Respond with JSON:
    if (req.accepts('json')) {
      res.send({ error: 'Not found'});
      return;
    }

    // Default to plain text:
    res.type('txt').send('Not found');
  });
});


// TODO: better error handling and logging
app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('test', function () {
  app.get('/emails', function(req, res){
    res.send(JSON.stringify(mailerService.transport.emails));
  });
});

app.configure('production', function () {
  app.use(express.errorHandler());
});


// Bootstrap routes
require('./routes')(app, passport);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Listening on ' + config.node.host + ':' + app.get('port'));
});