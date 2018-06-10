'use strict'

const fs = require('fs')
const Promise = require('bluebird')
const readline = require('readline')
const { google } = require('googleapis')

Promise.promisifyAll(fs)

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

exports.Gsheet = class {

  constructor (options) {
    const {client_secret, client_id, redirect_uris} = JSON.parse(options.credentials).installed
    this.oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0])

    this.token = options.token
    this.spreadsheetId = options.spreadsheetId
  }

  open() {
    if (!this.openPromise) {
      this.openPromise = Promise.resolve()
        .then(() => {
          if (!this.token) {
            return this.getNewToken()
          }
          this.oAuth2Client.setCredentials(JSON.parse(this.token))
        })
    }

    return this.openPromise
  }

  getNewToken() {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close()
      this.oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err)

        console.log(JSON.stringify(token))
        process.exit(0)
      })
    })

    return Promise.fromCallback(() => {})
  }

  readData(range) {
    const sheets = google.sheets({version: 'v4', auth: this.oAuth2Client})

    return this.open()
      .then(() => Promise.fromCallback(cb => sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      }, cb)))
      .then(response => {
        if (response.status === 200) {
          return response.data.values
        } else {
          throw new Error('Error reading data from datastore')
        }
      })
  }

  writeData(range, data) {
    const sheets = google.sheets({version: 'v4', auth: this.oAuth2Client})

    return this.open()
      .then(() => Promise.fromCallback(cb => sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          majorDimension: 'ROWS',
          values: data
        }
      }, cb)))
      .then(response => {
        if (response.status === 200) {
          return response.data
        } else {
          throw new Error('Error reading data from datastore')
        }
      })
  }

  createSpreadsheet(sheetName, { skipIfExists } = {}) {
    const sheets = google.sheets({version: 'v4', auth: this.oAuth2Client})

    return this.open()
      .then(() => Promise.fromCallback(cb => sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      }, cb)))
      .then(response => {
        if (response.status === 200) {
          return response.data
        } else {
          throw new Error('Error fetching sheet data')
        }
      })
      .then(spreadsheets => {
        if (spreadsheets.sheets.some(s => s.properties.title === sheetName)) {
          if (!skipIfExists) {
            throw new Error('Spreadsheet already exists')
          }

          return false
        } else {
          return Promise.fromCallback(cb => sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
              requests: [{
                addSheet: {
                  properties: {
                    title: sheetName,
                    index: 0
                  }
                }
              }]
            }
          }, cb))
            .then(response => {
              if (response.status !== 200) {
                throw new Error('Error creating a new sheet')
              }
            })
            .return(true)
        }
      })
  }
}
