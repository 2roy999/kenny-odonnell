'use strict'

const { DateTime } = require('luxon')
const caporal = require('caporal')

const { remindDuty } = require('./reminders/duties')

exports.defineCli = (dependencies) => {
  caporal
    .command('remind duty')
    .action((args, options, logger) => {
      remindDuty(DateTime.local().startOf('day'), dependencies)
        .then(() => logger.info('Duty reminded'))
        .catch(err => logger.error('Error during reminding duty:', err))
    })

  return caporal
}