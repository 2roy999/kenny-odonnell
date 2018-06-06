'use strict'

const axios = require('axios')

const TELEGRAM_BASE_URL_PREFIX = 'https://api.telegram.org/bot'

exports.TelegramBot = class {

  constructor (options) {
    this.apiKey = options.apiKey

    this.axios = axios.create({
      baseURL: `${TELEGRAM_BASE_URL_PREFIX}${this.apiKey}/`
    })
  }

  sendMessage(user, message) {
    return this.axios.get('sendMessage', {
      params: {
        'chat_id': user.telegramChatId,
        'text': message
      }
    })
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Could not send message to telegram')
        }
      })
  }

}