'use strict'

var tests = [
  // require('./specs/timeout.test.js'),

  // handlers
  require('./specs/handlers/errorHandlers.test.js'),
  require('./specs/handlers/notFoundHandler.test.js'),
  require('./specs/handlers/postExecutionHandler.test.js'),

  // Headers
  require('./specs/headers/headersFormat.test.js'),

  // phrases
  require('./specs/phrases/getAllPhrases.test.js'),
  require('./specs/phrases/getPhrase.test.js'),
  require('./specs/phrases/orderExecutionPhrases.test.js'),
  require('./specs/phrases/upsertPhrase.test.js'),
  require('./specs/phrases/deletePhrase.test.js'),
  require('./specs/phrases/unregisterPhrases.test.js'),
  require('./specs/phrases/invalidCorbelJsRequest.error.test.js'),
  require('./specs/phrases/multipleVersions.test.js'),
  require('./specs/phrases/mock.middleware.test.js'),
  require('./specs/phrases/cacheInvalidation.test.js'),
  require('./specs/phrases/cachedResponses.test.js'),
  require('./specs/phrases/cacheTimeout.test.js'),

  // snippets
  require('./specs/snippets/multipleSnippetsForPhrases.test.js'),
  require('./specs/snippets/upsertSnippet.test.js'),
  require('./specs/snippets/deleteSnippet.test.js'),
  require('./specs/snippets/unregisterSnippets.test.js'),

  // params
  require('./specs/params/queryParams.test.js'),
  require('./specs/params/pathParams.test.js'),

  // other
  require('./specs/docField.test.js'),
  require('./specs/cache.test.js'),
  require('./specs/domainUserReturnsNotFound.test.js'),
  require('./specs/methodNotAllowed.test.js'),
  require('./specs/status.endpoint.test.js')
]

module.exports = function (serverPromise) {
  var server

  describe('setup', function () {
    this.timeout(60000)
    before(function (done) {
      // Wait for app initialization
      serverPromise.then(function (res) {
        server = res
        console.info('---------------- Integration tests ------------------')
        done()
      })
    })

    // This wrapping is needed because otherwise application would be an empty object
    it('Executes the integration tests', function () {
      tests.forEach(function (test) {
        test(server)
      })
    })
  })
}
