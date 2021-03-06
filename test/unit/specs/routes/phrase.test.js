'use strict'
/* globals beforeEach afterEach describe it */

var chai = require('chai')
var sinon = require('sinon')
var expect = chai.expect
var chaiAsPromised = require('chai-as-promised')
var Phrase = require('../../../../src/routes/phrase.js').Phrase

chai.use(chaiAsPromised)

describe('BaseResoure upsert, delete and get', function () {
  this.timeout(10000)

  var sandbox
  var stubGetAuthorization
  var stubGetDriver
  var stubGetDomain
  var stubPublishAvailability
  var stubValidate
  var stubEmitEvent
  var stubUpsertCall
  var stubDeleteCall
  var stubGetAllCall

  var req = {
    body: {
      version: '1.2.3',
      url: 'user/me'
    },
    params: {
      itemId: 'testPhrase'
    }
  }

  var res = {
    status: 200,
    data: 'test finished'
  }

  var auth = {
    auth: 'testAuth'
  }

  var driver = 'driver'
  var domain = 'domain'
  var fullId = 'testPhrase'
  var textEvent = 'phrase:upsert'

  beforeEach(function () {
    sandbox = sinon.sandbox.create()

    stubGetAuthorization = sandbox.stub(Phrase, 'getAuthorization', function () {
      return auth
    })
    stubGetDriver = sandbox.stub(Phrase, 'getDriver', function () {
      return driver
    })
    stubGetDomain = sandbox.stub(Phrase, 'getDomain', function () {
      return domain
    })
    stubPublishAvailability = sandbox.stub(Phrase, 'checkPublishAvailability', function () {
      return Promise.resolve()
    })
    stubValidate = sandbox.stub(Phrase, 'validate', function () {
      return Promise.resolve()
    })
    stubEmitEvent = sandbox.stub(Phrase, 'emitEvent')
    stubUpsertCall = sandbox.stub(Phrase, 'upsertCall').returns(Promise.resolve(res))
    stubDeleteCall = sandbox.stub(Phrase, 'deleteCall').returns(Promise.resolve(res))
    stubGetAllCall = sandbox.stub(Phrase, 'getAllItems').returns(Promise.resolve(res))
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('Phrase.upsert works correctly', function (done) {
    Phrase.upsert(req, { setHeader: function () {},
      send: function (status) {
        expect(status).to.be.equal(200)
        expect(stubGetAuthorization.callCount).to.equals(1)
        expect(stubGetAuthorization.calledWith(req)).to.equals(true)
        expect(stubGetDriver.callCount).to.equals(1)
        expect(stubGetDriver.calledWith(auth)).to.equals(true)
        expect(stubGetDomain.callCount).to.equals(1)
        expect(stubGetDomain.calledWith(auth)).to.equals(true)
        expect(stubPublishAvailability.callCount).to.equals(1)
        expect(stubPublishAvailability.calledWith(driver)).to.equals(true)
        expect(stubValidate.callCount).to.equals(1)
        expect(stubValidate.calledWith(req.body)).to.equals(true)
        expect(stubEmitEvent.callCount).to.equals(1)
        expect(stubEmitEvent.calledWith(textEvent, domain, req.body.id)).to.equals(true)
        expect(stubUpsertCall.callCount).to.equals(1)
        expect(stubUpsertCall.calledWith(domain, req.body)).to.equals(true)

        done()
      }
    })
  })

  it('Phrase.delete works correctly', function (done) {
    sandbox.stub(Phrase, 'getItemById', function () {
      return {
        getDomain: function () {
          return domain
        }
      }
    })

    Phrase.delete(req, {
      send: function (status) {
        expect(status).to.be.equal(204)
        expect(stubGetAuthorization.callCount).to.equals(1)
        expect(stubGetAuthorization.calledWith(req)).to.equals(true)
        expect(stubGetDriver.callCount).to.equals(1)
        expect(stubGetDriver.calledWith(auth)).to.equals(true)
        expect(stubGetDomain.callCount).to.equals(1)
        expect(stubGetDomain.calledWith(auth)).to.equals(true)
        expect(stubDeleteCall.callCount).to.equals(1)
        expect(stubDeleteCall.calledWith(fullId)).to.equals(true)

        done()
      }
    })
  })

  it('Phrase.get works correctly', function (done) {
    var stubGetCall = sandbox.stub(Phrase, 'getItemById', function () {
      return {
        getDomain: function () {
          return domain
        },
        getRawModel: () => {
        }
      }
    })

    Phrase.get(req, {
      send: function (status) {
        expect(status).to.be.equal(200)
        expect(stubGetAuthorization.callCount).to.equals(1)
        expect(stubGetAuthorization.calledWith(req)).to.equals(true)
        expect(stubGetDomain.callCount).to.equals(1)
        expect(stubGetDomain.calledWith(auth)).to.equals(true)
        expect(stubGetCall.callCount).to.equals(1)
        expect(stubGetCall.calledWith(fullId)).to.equals(true)

        done()
      }
    })
  })

  it('Phrase.getAll works correctly', function (done) {
    Phrase.getAll(req, {
      send: function (status) {
        expect(status).to.be.equal(200)
        expect(stubGetAuthorization.callCount).to.equals(1)
        expect(stubGetAuthorization.calledWith(req)).to.equals(true)
        expect(stubGetDomain.callCount).to.equals(1)
        expect(stubGetDomain.calledWith(auth)).to.equals(true)
        expect(stubGetAllCall.callCount).to.equals(1)
        expect(stubGetAllCall.calledWith(domain)).to.equals(true)

        done()
      }
    })
  })
})
