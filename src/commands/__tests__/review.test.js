/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions, max-nested-callbacks */

import nock from 'nock'

import {
  notifiesWithUsageMessageForDashH,
  notifiesWithUsageHintForInvalidArgs,
  notifiesWithErrorIfNotAPlayer,
  notifiesWithErrorForAPIErrors,
  notifiesWithErrorForGraphQLErrors,
} from '../../../test/commonTests'

describe(testContext(__filename), function () {
  describe('invoke', function () {
    before(function () {
      this.invoke = require('../review').invoke

      this.notify = msg => {
        this.notifications.push(msg)
      }
      this.formatError = msg => `__FMT: ${msg}`
      this.argv = ['#some-project', '93']
      this.lgJWT = 'not.a.real.token'
      this.lgUser = {id: 'not.a.real.id', roles: ['player']}
    })

    beforeEach(function () {
      this.notifications = []
    })

    afterEach(function () {
      nock.cleanAll()
    })

    it('notifies with the usage message when requested', notifiesWithUsageMessageForDashH)
    it('notifies with a usage hint when called with no args', notifiesWithUsageHintForInvalidArgs([]))
    it('notifies with an error message when invoked by a non-player', function () {
      return notifiesWithErrorIfNotAPlayer(this.argv).bind(this)()
    })
    it('notifies of API invocation errors', function (done) {
      return notifiesWithErrorForAPIErrors(this.argv).bind(this)(done)
    })
    it('notifies of GraphQL invocation errors', function (done) {
      return notifiesWithErrorForGraphQLErrors(this.argv).bind(this)(done)
    })

    describe('getting review status', function () {
      beforeEach(function () {
        this.argv = ['#some-project']
      })

      it('displays the current stats when review in progress', function () {
        nock('http://game.learnersguild.test')
          .post('/graphql')
          .reply(200, {data: {getProjectReviewSurveyStatus: {
            project: {artifactURL: 'http://artifact.example.com'},
            completed: false,
            responses: [
              {questionName: 'completeness', values: [{value: 8}]},
            ]
          }}})

        const {lgJWT, lgUser} = this
        return this.invoke(this.argv, this.notify, {lgJWT, lgUser})
          .then(() => {
            expect(this.notifications[0]).to.match(/completeness:\s+`8`/i)
            expect(this.notifications[0]).to.match(/artifact\.example\.com/)
          })
      })

      it('displays a message about a missing artifactURL if it\'s missing', function () {
        nock('http://game.learnersguild.test')
          .post('/graphql')
          .reply(200, {data: {getProjectReviewSurveyStatus: {
            project: {artifactURL: undefined},
            completed: false,
            responses: [
              {questionName: 'completeness', values: [{value: 8}]},
            ]
          }}})

        const {lgJWT, lgUser} = this
        return this.invoke(this.argv, this.notify, {lgJWT, lgUser})
          .then(() => {
            expect(this.notifications[0]).to.match(/artifact URL .* has not been set/i)
          })
      })

      it('displays the status without the artifact when the review is completed', function () {
        nock('http://game.learnersguild.test')
          .post('/graphql')
          .reply(200, {data: {getProjectReviewSurveyStatus: {
            project: {artifactURL: 'http://artifact.example.com'},
            completed: true,
            responses: [
              {questionName: 'completeness', values: [{value: 8}]},
              // {questionName: 'quality', values: [{value: 9}]},
            ]
          }}})

        const {lgJWT, lgUser} = this
        return this.invoke(this.argv, this.notify, {lgJWT, lgUser})
          .then(() => {
            expect(this.notifications[0]).to.match(/completeness:\s+`8`/i)
            expect(this.notifications[0]).to.not.match(/artifact\.example\.com/)
          })
      })

      it('displays the status without the responses when the review has not been started', function () {
        nock('http://game.learnersguild.test')
          .post('/graphql')
          .reply(200, {data: {getProjectReviewSurveyStatus: {
            project: {artifactURL: 'http://artifact.example.com'},
            completed: false,
            responses: [],
          }}})

        const {lgJWT, lgUser} = this
        return this.invoke(this.argv, this.notify, {lgJWT, lgUser})
          .then(() => {
            expect(this.notifications[0]).not.to.match(/completeness:/i)
            expect(this.notifications[0]).to.match(/artifact\.example\.com/)
          })
      })
    })

    it('notifies that project completeness has been recorded', function () {
      nock('http://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {saveProjectReviewCLISurveyResponses: {createdIds: [
          '00000000-1111-2222-3333-444444444444',
        ]}}})
      nock('http://game.learnersguild.test')
        .post('/graphql')
        .reply(200, {data: {getProjectReviewSurveyStatus: {
          project: {artifactURL: 'http://artifact.example.com'},
          completed: true,
          responses: [
            {questionName: 'completeness', values: [{value: 8}]},
          ]
        }}})

      const {lgJWT, lgUser} = this
      return this.invoke(this.argv, this.notify, {lgJWT, lgUser})
        .then(() => {
          expect(this.notifications[0]).to.match(/Completeness score captured/i)
        })
    })
  })
})
