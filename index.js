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
  environment: process.env.ENVIRONMENT
})

const dutiesManager = new DutiesManager({
  gsheet,
  dateFormat: process.env.DATASTORE_DATE_FORMAT
})

const userManager = new UserManager({
  keyValueStore
})

const telegramBot = new TelegramBot({
  apiKey: process.env.TELEGRAM_API_KEY
})

gsheet.open()
  .then(() => userManager.getUser('jj'))
  .then(user => telegramBot.sendMessage(user, 'Hello World'))
  .then(response => {
    console.log(response)
  })
  .catch(err => console.error(err))