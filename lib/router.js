'use strict'

const { DateTime } = require('luxon')
const { Router } = require('express')

const { remindDuty } = require('./reminders/duties')

exports.routerFactory = (options) => {
  const router = new Router()

  router.get('/remind/duty/today', (req, res, next) => {
    remindDuty(DateTime.local().startOf('day'), options)
      .then(() => res.status(200).end())
      .catch(err => {
        res.status(500)
          .json({message: err.message})
          .end()

        next(err)
      })
  })

  return router
}