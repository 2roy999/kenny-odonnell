'use strict'

exports.DutiesManager = class {

  constructor (options) {
    this.gsheet = options.gsheet
    this.userManager = options.userManager
    this.dateFormat = options.dateFormat
  }

  _createMonthlyDuties(dutyMonthDate) {
    const sheet = `${dutyMonthDate.monthLong} ${dutyMonthDate.year}`
    const startOfMonth = dutyMonthDate.startOf('month')

    return this.gsheet.createSpreadsheet(sheet, { skipIfExists: true })
      .then(createdNew => {
        if (createdNew) {
          return Promise.all([
            this.getUserOfDuty(startOfMonth.minus({ day: 1 }), { existsOnly: true }),
            this.userManager.getAllUsers()
          ])
            .then(([lastUser, allUsers]) => {
              const data = []
              const lastUserIndex = allUsers.map((u, i) => i)
                .find(i => allUsers[i].name === lastUser.name)

              let userIndex = (lastUserIndex + 1) % 3
              let currentDate = startOfMonth

              while (currentDate.month === startOfMonth.month) {
                data.push([currentDate.toFormat(this.dateFormat), allUsers[userIndex].name])

                userIndex = (userIndex + 1) % allUsers.length
                currentDate = currentDate.plus({ day: 1 })
              }

              return this.gsheet.writeData(`${sheet}!A1:B${data.length + 1}`, [['Date', '']].concat(data))
          })
        }
      })
  }

  getUserOfDuty (dutyDay, { existsOnly } = {}) {
    const sheet = `${dutyDay.monthLong} ${dutyDay.year}`
    const formattedDutyDay = dutyDay.toFormat(this.dateFormat)

    return Promise.resolve()
      .then(() => {
        if (!existsOnly) {
          return this._createMonthlyDuties(dutyDay)
        }
      })
      .then(() => this.gsheet.readData(`${sheet}!A2:B32`))
      .then(data => {
        if (data.length !== 0) {
          const row = data.find(([day]) => day === formattedDutyDay)
          return row ? row[1] : null
        } else {
          return null
        }
      })
      .then(alias => this.userManager.getUser(alias))
  }
}