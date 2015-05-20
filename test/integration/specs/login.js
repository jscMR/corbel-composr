'use strict';
var request = require('supertest'),
    chai = require('chai'),
    expect = chai.expect,
    clientUtils = require('../utils/client');

var clientData = clientUtils.getAdminClient();
var demoAppClientData = clientUtils.getDemoClient();

var clientToken,
    phraseClientLoginLocation,
    demoAppClientToken,
    demoAppRefreshToken,
    clientLoginPhraseUrl;

function test(app) {
    describe('With Login phrases,', function() {

        var loginphrase = require('../../fixtures/phrases/phraseLoginClient.json');

        before(function(done) {
            this.timeout(30000);
            request(app)
                .post('/token')
                .send(demoAppClientData)
                .expect(200)
                .end(function(err, response) {
                    expect(response).to.be.an('object');
                    expect(response.body.data.accessToken).to.exist;
                    clientToken = response.body.data.accessToken;
                    done(err);
                });
        });

        describe('client login phrase', function() {

            it('is created correctly', function(done) {
                this.timeout(30000);
                request(app)
                    .put('/phrase')
                    .set('Authorization', clientToken)
                    .send(loginphrase)
                    .expect(204)
                    .end(function(err, response) {
                        expect(response.headers).to.exist;
                        phraseClientLoginLocation = response.headers['location'];
                        expect(phraseClientLoginLocation.length).to.be.above(0);
                        done(err);
                    });
            });

            it('receives a token after calling it', function(done) {
                var phraseEndpoint = loginphrase.url;
                var domain = phraseClientLoginLocation.replace('phrase/', '').split('!')[0];
                clientLoginPhraseUrl = '/' + domain + '/' + phraseEndpoint;
                this.timeout(30000);

                //let's wait till corbel triggers the event to register the phrase in composr
                //TODO: use any tool to know when it happens
                setTimeout(function() {

                    request(app)
                        .post(clientLoginPhraseUrl)
                        .send(demoAppClientData)
                        .expect(200)
                        .end(function(err, response) {
                            expect(response).to.be.an('object');
                            expect(response.body.data.accessToken).to.exist;
                            demoAppClientToken = response.body.data.accessToken;
                            done(err);
                        });

                }, 2000);

            });

        });


        describe('user login phrase', function() {

            var phraseUserLoginLocation;
            var userLoginPhrase = require('../../fixtures/phrases/phraseLoginUser.json');

            it('is created correctly', function(done) {
                this.timeout(30000);
                request(app)
                    .put('/phrase')
                    .set('Authorization', clientToken)
                    .send(userLoginPhrase)
                    .expect(204)
                    .end(function(err, response) {
                        expect(response.headers).to.exist;
                        phraseUserLoginLocation = response.headers['location'];
                        expect(phraseUserLoginLocation.length).to.be.above(0);
                        done(err);
                    });
            });

            it('receives a token/expires/refresh after calling it', function(done) {
                var phraseEndpoint = userLoginPhrase.url;
                var domain = phraseUserLoginLocation.replace('phrase/', '').split('!')[0];
                clientLoginPhraseUrl = '/' + domain + '/' + phraseEndpoint;

                //Returns the data needed to make a user login
                var demoUserData = clientUtils.getUser();

                this.timeout(30000);

                //let's wait till corbel triggers the event to register the phrase in composr
                //TODO: use any tool to know when it happens
                setTimeout(function() {

                    request(app)
                        .post(clientLoginPhraseUrl)
                        .set('Authorization', clientToken)
                        .send(demoUserData)
                        .expect(200)
                        .end(function(err, response) {
                            expect(response).to.be.an('object');
                            expect(response.body).to.be.an('object');
                            expect(response.body.tokenObject).to.be.an('object');
                            expect(response.body.user).to.be.an('object');
                            expect(response.body.tokenObject.accessToken).to.exist;
                            expect(response.body.tokenObject.expiresAt).to.exist;
                            expect(response.body.tokenObject.refreshToken).to.exist;
                            demoAppClientToken = response.body.tokenObject.accessToken;
                            demoAppRefreshToken = response.body.tokenObject.refreshToken;
                            done(err);
                        });

                }, 2000);

            });

        });

        describe('user tokenRefresh phrase', function() {

            var refreshTokenLocation;
            var refreshTokenPhrase = require('../../fixtures/phrases/refreshToken.json');

            it('is created correctly', function(done) {
                this.timeout(30000);
                request(app)
                    .put('/phrase')
                    .set('Authorization', clientToken)
                    .send(refreshTokenPhrase)
                    .expect(204)
                    .end(function(err, response) {
                        expect(response.headers).to.exist;
                        refreshTokenLocation = response.headers['location'];
                        expect(refreshTokenLocation.length).to.be.above(0);
                        done(err);
                    });
            });

            it('can refresh user token with refreshToken', function(done) {
                var phraseEndpoint = refreshTokenPhrase.url;
                var domain = refreshTokenLocation.replace('phrase/', '').split('!')[0];
                clientLoginPhraseUrl = '/' + domain + '/' + phraseEndpoint;

                //Returns the data needed to make a user login
                var data = {
                    refreshToken: demoAppRefreshToken,
                    scopes: clientUtils.getUser().scopes
                };

                this.timeout(30000);

                //let's wait till corbel triggers the event to register the phrase in composr
                //TODO: use any tool to know when it happens
                setTimeout(function() {

                    request(app)
                        .post(clientLoginPhraseUrl)
                        .set('Authorization', clientToken)
                        .send(data)
                        .expect(200)
                        .end(function(err, response) {
                            expect(response).to.be.an('object');
                            expect(response.body).to.be.an('object');
                            expect(response.body.data).to.be.an('object');
                            expect(response.body.data.accessToken).to.exist;
                            expect(response.body.data.expiresAt).to.exist;
                            expect(response.body.data.refreshToken).to.exist;
                            expect(response.body.data.refreshToken).to.not.be.equal(demoAppRefreshToken);
                            demoAppClientToken = response.body.data.accessToken;
                            demoAppRefreshToken = response.body.data.refreshToken;
                            done(err);
                        });

                }, 2000);

            });
        });


    });


}

module.exports = test;
