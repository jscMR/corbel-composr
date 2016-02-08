'use strict';
var request = require('supertest'),
  chai = require('chai'),
  q = require('q'),
  expect = chai.expect;

function test(server) {

  describe('When a request to composr has errors', function() {

    it('it fails with a 500 error', function(done) {

      request(server.app)
        .get('/e1')
        .expect(500)
        .end(function(error, response) {

          expect(response).to.be.an('object');
          if (response.statusCode === 500) {
            return done();
          } else {
            return done(error || response);
          }

        });
    });

    it('it fails with a 555 error with e2', function(done) {

      request(server.app)
        .get('/e2')
        .expect(555)
        .end(function(error, response) {
          
          expect(response).to.be.an('object');
          expect(response.body.error).to.equals('error:custom');
          
          if (response.statusCode === 555) {
            return done();
          } else {
            return done(error || response);
          }

        });
    });
  });
}

module.exports = test;