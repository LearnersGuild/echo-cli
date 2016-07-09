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
      this.invoke = require('../profile').invoke

      this.notify = msg => {
        this.notifications.push(msg)
      }
    })
    beforeEach(function () {
      this.notifications = []
    })

    it('notifies with the usage message when requested', notifiesWithUsageMessageForDashH)
    it('notifies with the usage hint if arguments are supplied', notifiesWithUsageHintForInvalidArgs(['ANYTHING']))

    it('notifies that the profile is being loaded', function () {
      return this.invoke([], this.notify)
        .then(() => {
          expect(this.notifications[0]).to.match(/Loading.+profile/i)
        })
    })
  })
})
