'use strict';

//Logging config

var winston = require('winston')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env];


if (typeof(config.loggly) !== 'undefined') {
  //Use loggly
  require('winston-loggly');
  var options = {
    subdomain: config.loggly.subdomain,
    inputToken: config.loggly.inputToken,
    auth: {
      username: config.loggly.username,
      password: config.loggly.password
    },
    json: config.loggly.json
  };
  winston.add(winston.transports.Loggly, options);
  exports.logger = winston;
}
else {
  //use a log file
  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)(
        { filename: 'traces.log', level: 'info', json: true })
    ]
  });
  exports.logger = logger;
}

// enable web server logging; pipe those log messages through winston
var winstonStream = {
    write: function(message, encoding) {
        winston.info(message);
    }
};

exports.loggerStream = winstonStream;
