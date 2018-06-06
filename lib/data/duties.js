'use strict'

exports.DutiesManager = class {

  constructor (options) {
    this.gsheet = options.gsheet
    this.userManager = options.userManager
    this.dateFormat = options.dateFormat
  }

  getUserOfDuty (dutyDay) {
    const sheet = `${dutyDay.monthLong} ${dutyDay.year}`
    const formattedDutyDay = dutyDay.toFormat(this.dateFormat)

    return this.gsheet.readData(`${sheet}!A2:b32`)
      .then(data => {
        const row = data.values.find(([day]) => day === formattedDutyDay)
        return row ? row[1] : null
      })
      .then(alias => this.userManager.getUser(alias))
  }
}