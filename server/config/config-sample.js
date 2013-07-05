var path = require('path');
module.exports = {
  development: {
    appName: "Test",
    email: {
      registration: "no_reply@test.com",
      info: "info@test.com"
    },

    node: {
      host: "localhost",
      distFolder: path.resolve(__dirname, '../../app'),
      port: 4000
    },

    NOT_USED_loggly: {
      subdomain: "REPLACE WITH LOGGLY SUBDOMAIN",
      inputToken: "REPLACE WITH LOGGLY INPUT TOKEN",
      auth: {
        username: "REPLACE WITH LOGGLY USERNAME",
        password: "REPLACE WITH LOGGLY PASSWORD"
      },
      json: true
    },

    NOT_USED_airbrake: {
      apiKey: "REPLACE WITH AIRBRAKE API"
    },

    neo4j: {
      host: "localhost",
      port: 7474,
      // user: ,
      // password:
    },

    sess: {
      secret: "REPLACE WITH SECRET"
    },

    cookie: {
      secret: "REPLACE WITH SECRET"
    },

    redis: {
      host: "localhost",
      port: 6379,
      // pass: ,
      // db: ,
      ttl: 1728000
    },

    smtp: {
      service: "Gmail",
      user: "REPLACE WITH EMAIL",
      pass: "REPLACE WITH PASSWORD"
    },

    NOT_USED_amazon: {
      AWSAccessKeyID: "REPLACE WITH AWSAccessKeyID",
      AWSSecretKey: "REPLACE WITH AWSSecretKey",
      ServiceUrl: "REPLACE WITH YOUR AWS Service URL"
    },

    facebook: {
      appId: "REPLACE WITH APP ID",
      appSecret: "REPLACE WITH APP SECRET",
      callbackURL: "http://localhost:4000/auth/facebook/callback"
    },

    google: {
      clientID: "REPLACE WITH CLIENT ID",
      clientSecret: "REPLACE WITH CLIENT SECRET",
      callbackURL: "http://localhost:4000/auth/google/callback"
    }
  },
  test: {
    appName: "Test",
    email: {
      registration: "no_reply@test.com",
      info: "info@test.com"
    },

    node: {
      host: "localhost",
      distFolder: path.resolve(__dirname, '../../app'),
      port: 4000
    },

    NOT_USED_loggly: {
      subdomain: "REPLACE WITH LOGGLY SUBDOMAIN",
      inputToken: "REPLACE WITH LOGGLY INPUT TOKEN",
      auth: {
        username: "REPLACE WITH LOGGLY USERNAME",
        password: "REPLACE WITH LOGGLY PASSWORD"
      },
      json: true
    },

    airbrake: {
      apiKey: "REPLACE WITH AIRBRAKE API"
    },

    neo4j: {
      host: "localhost",
      port: 7475,
      // user: ,
      // password:
    },

    sess: {
      secret: "REPLACE WITH SECRET"
    },

    cookie: {
      secret: "REPLACE WITH SECRET"
    },

    redis: {
      host: "localhost",
      port: 6379,
      // pass: ,
      // db: ,
      ttl: 1728000
    },

    smtp: {
      service: "Gmail",
      user: "REPLACE WITH EMAIL",
      pass: "REPLACE WITH PASSWORD"
    },

    NOT_USED_amazon: {
      AWSAccessKeyID: "REPLACE WITH AWSAccessKeyID",
      AWSSecretKey: "REPLACE WITH AWSSecretKey",
      ServiceUrl: "REPLACE WITH YOUR AWS Service URL"
    },

    facebook: {
      appId: "REPLACE WITH APP ID",
      appSecret: "REPLACE WITH APP SECRET",
      callbackURL: "http://localhost:4000/auth/facebook/callback"
    },

    google: {
      clientID: "REPLACE WITH CLIENT ID",
      clientSecret: "BgdvBWmZJBT3RJdax3WMTBvP",
      callbackURL: "http://localhost:4000/auth/google/callback"
    }
  }
};