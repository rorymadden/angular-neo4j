'use strict';

// User Unit Test
//

// MODULE DEPENDENCIES
// -------------------

var app = require('../../index')
  , should = require('should')
  , supertest = require('supertest')
  , request = supertest(app)
  , User = require('../../models/user')
  , neoprene = require('neoprene')
  , fakeUser
  , secondUser
  // , user1 = request.agent();
  ;

var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')[env];

var neo4jURI = 'http://' + config.neo4j.user + ':' +
  config.neo4j.password + '@' + config.neo4j.host + ':' +
  config.neo4j.port;
neoprene.connect(neo4jURI);

// TESTS
describe('routes_user:', function () {

  beforeEach(function (done) {
    fakeUser = {
      first: 'Fake',
      last: 'User',
      email: 'TestUser@test.com',
      password: 'TestPassword',
      gender: 'male'
    };
    secondUser = {
      first: 'New',
      last: 'Name',
      email: 'second@test.com',
      password: 'Newpass',
      gender: 'female'
    };

    // Drop the database.
    var query = 'start n=node(*) match n-[r?]->() delete r where id(n) <> 0 delete n';
    var params = {};

    neoprene.query(query, params, function(err, results) {
      done();
    });
  });

  /**
   * Anonymous User
   */
  describe('anonymous user: ', function () {

    describe('registration with correct details: ', function() {
      it('should register', function (done) {
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            done();
          });
      });
      it('VALIDATION - should register', function (done) {
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            User.findByEmail(fakeUser.email, function(err, user) {
              user.first.should.equal(fakeUser.first);
              done();
            });
          });
      });
      it('VALIDATION - should fail on missing info', function (done) {
        delete fakeUser.first;
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            User.findByEmail(fakeUser.email, function(err, user) {
              should.not.exist(user);
              done();
            });
          });
      });
      it('should fail on no first name', function (done) {
        delete fakeUser.first;
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });
      it('should fail on no last name', function (done) {
        delete fakeUser.last;
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });
      it('should fail on no email', function (done) {
        delete fakeUser.email;
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });
      it('should fail on bad gender', function (done) {
        fakeUser.gender = 'cat';
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });
      it('should fail on short password', function (done) {
        fakeUser.password = 'abc';
        request
          .post('/api/user/register')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });
    });
  });

  /**
   * User Activation
   */
  describe('registered:',function(){
    var registeredUser = {};
    beforeEach(function(done){
      fakeUser.first= 'Fake';
      request
        .post('/api/user/register')
        .send(fakeUser)
        .end(function(err, res){
          User.findByEmail(fakeUser.email, function(err, user){
            registeredUser = user;
            done();
          });
        });
    });
    it('should allow a second registration', function (done) {
      neoprene.getIndexedNodes('node_auto_index', 'email', fakeUser.email.toLowerCase().trim(), function(err, users) {
        users.length.should.equal(1);
        request
          .post('/api/user/register')
          .send(secondUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(200);
            User.findByEmail(fakeUser.email, function(err, user1) {
              user1.first.should.equal(fakeUser.first);
              User.findByEmail(secondUser.email, function(err, user2) {
                user2.first.should.equal(secondUser.first);
                done();
              });
            });
          });
      });
    });
    it('should reject login if user isn\'t active', function (done){
      request
        .post('/api/user/login')
        .send(fakeUser)
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(412);
          // res.header['location'].should.eql('/login');
          done();
        });
    });
    it('should activate with valid code', function (done){
      request
        .post('/api/user/activate/')
        .send({activationKey: registeredUser.activationKey})
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(200);
          User.findByEmail(fakeUser.email, function(err, user){
            user.active.should.be.ok;
            user.activationKeyUsed.should.be.ok;
            done();
          });
        });
    });
    it('should fail on invalid code', function (done){
      request
        .post('/api/user/activate/')
        .send('1234'+registeredUser.activationKey)
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(412);
          User.findByEmail(fakeUser.email, function(err, user){
            user.active.should.not.be.ok;
            user.activationKeyUsed.should.not.be.ok;
            done();
          });
        });
    });

    it('should resend activation code if email is correct', function (done){
      request
        .post('/api/user/resendActivation')
        .send(fakeUser)
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(200);
          //TODO: test email sending?
          done();
        });
    });
    it('should error if email is not registered', function (done){
      request
        .post('/api/user/resendActivation')
        .send({email: 'bademail@test.com'})
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(412);
          done();
        });
    });
    it('should fail registration if user already exists', function (done){
      request
        .post('/api/user/register')
        .send(fakeUser)
        .end(function(err, res){
          should.not.exist(err);
          res.should.have.status(412);
          done();
        });
    });
    it('VALIDATION - should fail registration if user already exists',
      function (done){
      request
        .post('/api/user/register')
        .send(fakeUser)
        .end(function(err, res){
          neoprene.getIndexedNodes('node_auto_index', 'email', fakeUser.email.toLowerCase().trim(), function(err, users) {
            users.length.should.equal(1);
            done();
          });
        });
    });


    /**
     * User Login
     */
    describe('activated:', function(){
      var activatedUser = {};
      beforeEach(function(done){
        request
          .post('/api/user/activate/')
          .send({activationKey: registeredUser.activationKey})
          .end(function(err, res){
            User.findByEmail(fakeUser.email, function(err, user){
              activatedUser = user;
              done();
            });
          });
      });
      describe('login:', function(){
        // var agent1 = request.agent();
        // var agent2 = request.agent();
        // it('should display the user login page', function(done){
        //   request
        //   .get('/login')
        //   .expect(200, done);
        // });
        it('should reject if no email', function (done){
          delete fakeUser.email;
          request
            .post('/api/user/login')
            .send(fakeUser)
            .end(function(err, res){
              should.not.exist(err);
              res.should.have.status(412);
              done();
            });
        });
        it('should reject if no password', function (done){
          delete fakeUser.password;
          request
            .post('/api/user/login')
            .send(fakeUser)
            .end(function(err, res){
              should.not.exist(err);
              res.should.have.status(412);
              done();
            });
        });
        it('should reject if user doesn\'t exist', function (done){
          fakeUser.email = 'bademail@test.com';
          request
            .post('/api/user/login')
            .send(fakeUser)
            .end(function(err, res){
              should.not.exist(err);
              res.should.have.status(500);
              done();
            });
        });
        it('should reject if password is wrong', function (done){
          fakeUser.password = 'bademail@test.com';
          request
            .post('/api/user/login')
            .send(fakeUser)
            .end(function(err, res){
              should.not.exist(err);
              res.should.have.status(412);
              done();
            });
        });
        it('should log in if the user is active', function(done){
          request
            .post('/api/user/logout');
            request
              .post('/api/user/login')
              .send({email: fakeUser.email, password: fakeUser.password})
              .end(function(err, res){
                should.not.exist(err);
                res.should.have.status(200);
                // TODO: need to verify that the cookie does not contain logintoken
                res.headers['set-cookie'][1].indexOf('logintoken').should.equal(-1);
                done();
            })
        });
        it('should create cookie if user selects remember_me', function(done){
          // var agent1 = supertest.agent();
          request
            .post('/api/user/logout');
            request
              .post('/api/user/login')
              .send({email: fakeUser.email, password: fakeUser.password, remember_me: true})
              .end(function(err, res){
                should.not.exist(err);
                // console.log('response :' + JSON.stringify(res.body));
                res.should.have.status(200);
                // need to verify that the cookie does contain logintoken
                res.headers['set-cookie'][1].indexOf('logintoken').should.not.equal(-1);
                request
                  .post('/api/user/logout')
                  .end(function(err, res){
                    // TODO: check that the cookie has been removed.
                    res.headers['set-cookie'][1].indexOf('logintoken').should.equal(-1);
                    // console.log('headers '+JSON.stringify(res.headers));
                    done();
                  });
            });
        });
      });
      it('should not allow resending of activation code', function (done){
        request
          .post('/api/user/resendActivation')
          .send(fakeUser)
          .end(function(err, res){
            should.not.exist(err);
            res.should.have.status(412);
            done();
          });
      });


      /**
       * Forgotten Password
       */
      describe('forgot password:', function(){

        it('should allow a user to request a new password', function (done){
          request
            .post('/api/user/forgotPassword')
            .send(fakeUser)
            .end(function(err, res){
              res.should.have.status(200);
              // TODO: test email
              done();
            });
        });
        it('should fail request on unknown email', function (done){
          request
            .post('/api/user/forgotPassword')
            .send({email: 'bademail@test.com'})
            .end(function(err, res){
              should.not.exist(err);
              res.should.have.status(412);
              done();
            });
        });
        describe('password reset sent:', function(){
          var token = '';
          var newPassword = 'newPassword';
          var passwordConfirm = newPassword;

          beforeEach(function(done){
            request
              .post('/api/user/forgotPassword')
              .send(fakeUser)
              .end(function(err, res){
                User.findByEmail(fakeUser.email, function (err, user) {
                  token = user.passwordResetKey;
                  done();
                });
              });
          });
          // it('should work if link clicked within time limit', function (done){
          //   request
          //     .post('/api/user/resetPassword')
          //     .send({ user_id: activatedUser.id, passwordResetKey: token })
          //     .expect(200, done);
          // });
          it('should error if password missing', function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: '',
              passwordConfirm: newPassword
            };
            request
              .post('/api/user/resetPassword')
              .send(passwordDetails)
              .end(function(err, res){
                should.not.exist(err);
                res.should.have.status(412);
                User.findByEmail(activatedUser.email ,function(err, user){
                  user.checkPassword(newPassword, function(err, isMatch){
                    isMatch.should.not.be.ok;
                    done();
                  });
                });
              });
          });
          it('should error if password confirm missing', function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: newPassword,
              passwordConfirm: ''
            };
            request
              .post('/api/user/resetPassword')
              .send(passwordDetails)
              .end(function(err, res){
                should.not.exist(err);
                res.should.have.status(412);
                User.findByEmail(activatedUser.email ,function(err, user){
                  user.checkPassword(newPassword, function(err, isMatch){
                    isMatch.should.not.be.ok;
                    done();
                  });
                });
              });
          });
          it('should pass if the passwords match', function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: newPassword,
              passwordConfirm: newPassword
            }
            request
              .post('/api/user/resetPassword')
              .send(passwordDetails)
              .end(function(err, res){
                should.not.exist(err);
                res.should.have.status(200);
                User.findByEmail(activatedUser.email ,function(err, user){
                  user.checkPassword(newPassword, function(err, isMatch){
                    isMatch.should.be.ok;
                    done();
                  });
                });
              });
          });
          it('should fail if the passwords do not match', function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: newPassword,
              passwordConfirm: 'bad password'
            };
            request
              .post('/api/user/resetPassword')
              .send(passwordDetails)
              .end(function(err, res){
                should.not.exist(err);
                res.should.have.status(412);
                User.findByEmail(activatedUser.email ,function(err, user){
                  user.checkPassword(newPassword, function(err, isMatch){
                    isMatch.should.not.be.ok;
                    done();
                  });
                });
              });
          });
          it('should pass if link clicked within time limit (30 mins)',
            function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: newPassword,
              passwordConfirm: newPassword
            };
            var oldDate = new Date();
            oldDate.setHours(oldDate.getHours() - 1);
            User.findByEmail(fakeUser.email, function(err, user) {
              user.passwordResetDate = oldDate;
              user.save(function (err, user){
                request
                  .post('/api/user/resetPassword')
                  .send(passwordDetails)
                  .end(function (err, res){
                    should.not.exist(err);
                    res.should.have.status(200);
                    done();
                  });
              });
            });
          });
          it('should fail if link not clicked within time limit',
            function (done){
            var passwordDetails = {
              user_id: activatedUser.id,
              passwordResetKey: token,
              password: newPassword,
              passwordConfirm: newPassword
            };
            var oldDate = new Date();
            oldDate.setHours(oldDate.getHours()-2);
            User.findByEmail(fakeUser.email, function (err, user) {
              user.passwordResetDate = oldDate;
              user.save(function (err, user) {
                request
                  .post('/api/user/resetPassword')
                  .send(passwordDetails)
                  .end(function(err, res){
                    should.not.exist(err);
                    res.should.have.status(412);
                    done();
                  });
              });
            });
          });
        });
      });
    });
  });
});