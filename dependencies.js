'use strict'

const { Gsheet } = require('./lib/data/gsheet')
const { KeyValueStore } = require('./lib/data/key-value')
const { DutiesManager } = require('./lib/data/duties')
const { UserManager } = require('./lib/data/users')
const { TelegramBot } = require('./lib/data/telegram')

const gsheet = new Gsheet({
  credentials: process.env.GOOGLE_CREDENTIALS,
  token: process.env.GOOGLE_TOKEN,
  spreadsheetId: process.env.DATASTORE_SPREADSHEET_ID
})

const keyValueStore = new KeyValueStore({
  gsheet,
  keyValueSheet: process.env.DATASTORE_KEY_VALUE_SHEET,
  environment: process.env.NODE_ENV
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

gsheet.open()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

exports.dependencies = {
  gsheet,
  keyValueStore,
  dutiesManager,
  userManager,
  telegramBot
}

