'use strict';

var app = require('../../index')
  , should = require('should')
  , express = require('express')
  , RedisStore = require("connect-redis")(express);

describe('app', function(){
  it('should expose app settings', function(done){
    var obj = app.locals.settings;
    obj.should.have.property('env', 'test');
    done();
  });
});

describe('sessions', function(){
  var store = new RedisStore();
  var sessionData = {
    cookie: {
      maxAge: 2000
    },
    name: 'tj'
  };
  // TODO: Find out why this before statement times out
  // Is there a risk that the store will not be instantiated when the tests run
  // before(function(done){
  //   store.client.on('connect', function(){
  //     done();
  //   });
  // });
  it('should be able to store sessions', function(done){
    store.set('123', sessionData, function(err, ok){
      should.not.exist(err);
      should.exist(ok);
      done();
    });
  });
  it('should be able to retrieve sessions', function(done){
    store.get('123', function(err, data){
      should.not.exist(err);
      data.should.be.a('object').and.have.property('name', sessionData.name);
      data.cookie.should.be.a('object').and.have.property('maxAge', sessionData.cookie.maxAge );
      done();
    });
  });
  after(function(done){
    store.set('123', sessionData, function(){
      store.destroy('123', function(){
        store.client.end();
        done();
      });
    });
  });
});

// describe('in development', function(){
//   // it('should enable "view cache"', function(){
//   //   process.env.NODE_ENV = 'development';
//   //   app.enabled('view cache').should.be.false;
//   //   process.env.NODE_ENV = 'test';
//   // }),
//   // This doesn't work because the variable is only being
//   // changed now. Would need to change it before instantiating app
//   it('should enable verbose errors', function(){
//     process.env.NODE_ENV = 'development';
//     app.enabled('verbose errors').should.be.true;
//     process.env.NODE_ENV = 'test';
//   })
// });