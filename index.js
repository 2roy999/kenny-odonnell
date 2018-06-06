'use strict'

const express = require('express')
const morgan = require('morgan')

const { Gsheet } = require('./lib/data/gsheet')
const { KeyValueStore } = require('./lib/data/key-value')
const { DutiesManager } = require('./lib/data/duties')
const { UserManager } = require('./lib/data/users')
const { TelegramBot } = require('./lib/data/telegram')
const { routerFactory } = require('./lib/router')

const gsheet = new Gsheet({
  credentials: process.env.GOOGLE_CREDENTIALS,
  token: process.env.GOOGLE_TOKEN,
  spreadsheetId: process.env.DATASTORE_SPREADSHEET_ID
})

const keyValueStore = new KeyValueStore({
  gsheet,
  keyValueSheet: process.env.DATASTORE_KEY_VALUE_SHEET,
  environment: process.env.ENVIRONMENT
})

const userManager = new UserManager({
  keyValueStore
})

const dutiesManager = new DutiesManager({
  gsheet,
  userManager,
  dateFormat: process.env.DATASTORE_DATE_FORMAT
})

const telegramBot = new TelegramBot({
  apiKey: process.env.TELEGRAM_API_KEY
})

const dependencies = {
  gsheet,
  keyValueStore,
  dutiesManager,
  userManager,
  telegramBot
}

const router = routerFactory(dependencies)

gsheet.open()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

const app = express()

app.use(morgan(process.env.MORGAN_FORMAT))
app.use(router)
app.listen(process.env.PORT)