'use strict'

const { DateTime } = require('luxon')
const Promise = require('bluebird')
const ejs = require('ejs')

const MESSAGE_TEMPLATE_KEY = 'reminders.duty.message_template'

exports.remindDuty = (dutyDay, options) => {
  const { dutiesManager, keyValueStore, telegramBot } = options

  return Promise.all([
    keyValueStore.get(MESSAGE_TEMPLATE_KEY),
    dutiesManager.getUserOfDuty(dutyDay)
  ])
    .then(([template, user]) => {
      return telegramBot.sendMessage(user, ejs.render(template, {
        name: user.name,
        isToday: DateTime.local().startOf('day').equals(dutyDay),
        dutyDay: dutyDay
      }))
    })
}