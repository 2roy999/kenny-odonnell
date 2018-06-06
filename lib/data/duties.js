'use strict'

exports.DutiesManager = class {

  constructor (options) {
    this.gsheet = options.gsheet
    this.dateFormat = options.dateFormat
  }

  getDuty (requestDay) {
    const sheet = `${requestDay.monthLong} ${requestDay.year}`
    const formatted = requestDay.toFormat(this.dateFormat)

    return this.gsheet.readData(`${sheet}!A2:b32`)
      .then(data => {
        const row = data.values.find(([day]) => day === formatted)
        return row ? row[1] : null
      })
  }
}