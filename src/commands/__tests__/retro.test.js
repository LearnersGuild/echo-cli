/* eslint-env mocha */
/* global expect, testContext */
/* eslint-disable prefer-arrow-callback, no-unused-expressions */

import {
  notifiesWithUsageMessageForDashH,
  notifiesWithUsageHintForInvalidArgs,
} from '../../../test/commonTests'

describe(testContext(__filename), function () {
  describe('invoke', function () {
    before(function () {
      this.invoke = require('../retro').invoke

      this.notify = msg => {
        this.notifications.push(msg)
      }
    })
    beforeEach(function () {
      this.notifications = []
    })

    it('notifies with the usage message when requested', notifiesWithUsageMessageForDashH)
    it('notifies with the usage hint if too many arguments are supplied', notifiesWithUsageHintForInvalidArgs(['#first-proj', '#second-proj']))

    describe('when passing a project name', function () {
      it('notifies that the provided retrospective survey is being looked for', function () {
        return this.invoke(['#stable-snake'], this.notify)
          .then(() => {
            expect(this.notifications[0]).to.match(/Looking for retrospective survey for #stable-snake .../i)
          })
      })
    })

    describe('without passing a project name', function () {
      it('notifies that the retrospective survey is being looked for', function () {
        return this.invoke(['#stable-snake'], this.notify)
          .then(() => {
            expect(this.notifications[0]).to.match(/Looking for retrospective survey .../i)
          })
      })
    })
  })
})
