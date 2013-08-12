'use strict';

// Account Unit Test
//

// MODULE DEPENDENCIES
// -------------------

var app = require('../../index')
  , should = require('should')
  , supertest = require('supertest')
  , request = supertest(app)
  , User = require('../../models/user')
  , authService = require('../../controllers/authService')
  , neoprene = require('neoprene')
  , superagent = require('superagent')
  , agent = superagent.agent()
  , agent2 = superagent.agent()
  , agent3 = superagent.agent()
  , fakeUser
  ;

var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);

supertest.Test.prototype.agent = function(agent){
  agent.attachCookies(this);
  return this;
};

var cookie;

// TESTS
describe('account pages:', function () {

  before(function (done) {
    // Drop the database.
    var query = 'START n=node(*) MATCH n-[r?]-() WHERE ID(n) <> 0 DELETE n,r';
    var params = {};

    neoprene.query(query, params, function(err, results) {
      fakeUser = {
        first: 'Fake',
        last: 'User',
        email: 'TestUser@test.com',
        password: 'TestPassword',
        gender: 'male'
      };

      request
        .post('/api/user/register')
        .send(fakeUser)
        .end(function(err, res){
          User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
            request
              .post('/api/user/activate/')
              .send({activationKey: user.activationKey})
              .end(function(err, res){
                agent.saveCookies(res);
                User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
                  user.active.should.be.ok;
                  user.activationKeyUsed.should.be.ok;
                  done();
                });
              });
          });
        });
    });
  });

  it('should return account details', function(done){
    request
      .get('/api/user/current-user')
      .agent(agent)
      .end(function(err, res){
        should.exist(res.body);
        res.body.first.should.equal(fakeUser.first);
        res.body.email.should.equal(fakeUser.email.toLowerCase());
        done();
      });
  });


  it('should allow an account to be updated', function(done){
    request
      .put('/api/account')
      .agent(agent)
      .send({first: 'New', last: 'Name', email: 'NewName@test.com', gender: 'male', password:'TestPassword'})
      .end(function(err, res){
        User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
          should.not.exist(err);
          should.not.exist(user);
          User.findOne({email: 'newname@test.com'}, function(err, user){
            fakeUser.email = 'newname@test.com';
            user.first.should.not.equal(fakeUser.first);
            user.first.should.equal('New');
            user.last.should.equal('Name');
            user.email.should.equal('newname@test.com');
            user.gender.should.equal('male');
            done();
          });
        });
      });
  });

  it('should fail account update if required data is missing', function(done){
    request
      .put('/api/account')
      .agent(agent)
      .send({first: '', last: 'Name', email: 'NewName@test.com', gender: 'male'})
      .end(function(err, res){
        should.not.exist(err);
        res.status.should.equal(412);
        done();
      });
  });

  it('should fail account update if password is not supplied', function(done){
    request
      .put('/api/account')
      .agent(agent)
      .send({first: 'New', last: 'Name', email: 'NewName@test.com', gender: 'male'})
      .end(function(err, res){
        should.not.exist(err);
        res.status.should.equal(412);
        done();
      });
  });

  it('should fail account update if password is blank', function(done){
    request
      .put('/api/account')
      .agent(agent)
      .send({first: 'New', last: 'Name', email: 'NewName@test.com', gender: 'male', password: ''})
      .end(function(err, res){
        should.not.exist(err);
        res.status.should.equal(412);
        done();
      });
  });

  it('should allow password change if passwords match', function(done){
    request
      .put('/api/account/editPassword')
      .agent(agent)
      .send({currentPassword: fakeUser.password, newPassword: 'Testing', passwordConfirm: 'Testing'})
      .end(function(err, res){
        User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
          user.checkPassword('Testing', function(err, isMatch){
            fakeUser.password = 'Testing';
            isMatch.should.be.ok;
            done();
          });
        });
      });
  });

  it('should fail password change if passwords do not match', function(done){
    request
      .put('/api/account/editPassword')
      .agent(agent)
      .send({currentPassword: fakeUser.password, newPassword: 'Testing', passwordConfirm: 'TEsting'})
      .end(function(err, res){
        User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
          user.checkPassword(fakeUser.password, function(err, isMatch){
            isMatch.should.be.ok;
            done();
          });
        });
      });
  });

  it('should fail password change if password does not meet criteria', function(done){
    request
      .put('/api/account/editPassword')
      .agent(agent)
      .send({currentPassword: fakeUser.password, newPassword: 'Test', passwordConfirm: 'Test'})
      .end(function(err, res){
        User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
          user.checkPassword(fakeUser.password, function(err, isMatch){
            isMatch.should.be.ok;
            done();
          });
        });
      });
  });

  it('should fail password change if password is blank', function(done){
    request
      .put('/api/account/editPassword')
      .agent(agent)
      .send({currentPassword: '', newPassword: 'Test', passwordConfirm: 'Test'})
      .end(function(err, res){
        User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
          user.checkPassword(fakeUser.password, function(err, isMatch){
            isMatch.should.be.ok;
            done();
          });
        });
      });
  });

  describe('login tokens: ', function(){
    before(function(done){
      // request
      //   .post('/api/user/logout')
      //   .agent(agent2)
        // .end(function(err, res){
          request
            .post('/api/user/login')
            .agent(agent2)
            .send({email: fakeUser.email.toLowerCase(), password: fakeUser.password, remember_me: true})
            .end(function(err, res){
              agent2.saveCookies(res);
              done();
            });
        // });
    });
    it('should return login tokens', function(done){
      request
        .get('/api/account/security')
        .agent(agent2)
        .end(function(err, res){
          should.exist(res.body[0]);
          //TODO: maybe a content test
          res.body[0].ip.should.equal("127.0.0.1")
          res.body[0]._nodeType.should.equal("LoginToken")
          done();
        });
    });
  });
  describe('login token delete: ', function(){
    beforeEach(function(done){
      request
        .post('/api/user/login')
        .agent(agent3)
        .send({email: fakeUser.email, password: fakeUser.password, remember_me: true})
        .end(function(err, res){
          agent3.saveCookies(res);
          request
            .get('/api/account/security')
            .agent(agent3)
            .end(function(err, res){
              cookie = res.body[0];
              should.exist(res.body[0]);
              done();
            });
        });
    });
    it('should allow deletion of login tokens', function(done){
      request
        .del('/api/account/security/'+ cookie._id)
        .agent(agent3)
        .end(function(err, res){
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('linked accounts: ', function(){
    var facebook = {
      _json: {
        first_name: 'faceFirst',
        last_name: 'faceLast',
        email: 'newname@test.com',
        gender: 'male',
        birthday: '06/16/1982',
        id: "12397817"
      }
    };
    var google = {
      _json: {
        given_name: 'googFirst',
        family_name: 'googLast',
        email: 'newname@test.com',
        gender: 'female',
        birthday: '1982-06-16',
        id: "23578291208945903329475"
      }
    };
    // beforeEach(function(done){
    //   // TODO: Need to link a facebook / google account
    //   authService.loginOrCreate('facebook', facebook, function(err, user){
    //     done();
    //   });
    // });

    // check whether we should do this here?
    it('should allow linking of new accounts', function(done){
      authService.loginOrCreate('google', google, function(err, user){
        should.exist(user);
        done();
      });
    });

    // need to be able to put
    it('should return linked accounts', function(done){
      authService.loginOrCreate('facebook', facebook, function(err, user){
        request
          .get('/api/account/linkedAccounts')
          .agent(agent)
          .end(function(err, res){
            res.body.should.be.an.array;
            res.body.should.have.length(2);
            should.exist(res.body[0]);
            //TODO: content test
            done();
          });
      });
    });

    it('should allow the removal of a linked account', function(done){
      authService.loginOrCreate('facebook', facebook, function(err, user){
        request
          .get('/api/account/linkedAccounts')
          .agent(agent)
          .end(function(err, res){
            request
              .del('/api/account/linkedAccounts/'+res.body[0]._id)
              .agent(agent)
              .end(function(err, res){
                res.should.have.status(200);
                done();
              });
          });
      });
    });
    it('should reject the removal of a linked account with a bad id', function(done){
      authService.loginOrCreate('facebook', facebook, function(err, user){
        request
          .get('/api/account/linkedAccounts')
          .agent(agent)
          .end(function(err, res){
            request
              .del('/api/account/linkedAccounts/1234')
              .agent(agent)
              .end(function(err, res){
                res.should.have.status(412);
                done();
              });
          });
      });
    });
  });

  //  All returning 500 - not sure why - but 500 works
  describe('logged out:', function(){
    // Logged Out
    beforeEach(function(done){
      request
        .post('/api/user/logout')
        .agent(agent)
        .end(function(err, res){
          agent.saveCookies(res);
          done();
        });
    });
    it('should not return account details if logged out', function(done){
      request
        .get('/api/user/current-user')
        .agent(agent)
        .end(function(err, res){
          res.should.have.status(200);
          should.not.exist(res.body.user);
          done();
        });
    });

    it('should fail account update', function(done){
      request
        .put('/api/account')
        .agent(agent)
        .send({first: 'First', last: 'Name', email: 'NewName@test.com', gender: 'male', password: 'TestPassword'})
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(401);
          done();
        });
    });

    it('should fail password update', function(done){
      request
        .put('/api/account/editPassword')
        .agent(agent)
        .send({currentPassword: fakeUser.password, newPassword: 'Testing', passwordConfirm: 'Testing'})
        .end(function(err, res){
          res.should.have.status(401);
          User.findOne({email: fakeUser.email.toLowerCase()}, function(err, user){
            user.checkPassword(fakeUser.password, function(err, isMatch){
              isMatch.should.be.true;
              done();
            });
          });
        });
    });

    it('should not return login tokens', function(done){
      request
        .get('/api/account/security')
        .agent(agent)
        .end(function(err, res){
          should.not.exist(res.body[0]);
          res.should.have.status(401);
          done();
        });
    });

    // it('should fail login token delete', function(done){
    //   test
    //   done();
    // });

    it('should not return linked accounts', function(done){
      request
        .get('/api/account/linkedAccounts')
        .agent(agent)
        .end(function(err, res){
          should.not.exist(res.body[0]);
          done();
        });
    });
  });
});