'use strict'

const KEY = 'key'
const A_CHAR_CODE = 'A'.charCodeAt(0)

exports.KeyValueStore = class {

  constructor (options) {
    this.gsheet = options.gsheet
    this.keyValueSheet = options.keyValueSheet
    this.environment = options.environment
  }

  _getColumns () {
    if (!this.columnsPromise) {
      this.columnsPromise = this.gsheet.readData(`${this.keyValueSheet}!A1:Z1`)
        .then(data => {
          return data.values[0].map((cell, i) => [cell, i])
            .filter(([cell]) => cell === KEY || cell === this.environment)
            .map(([cell, i]) => ({ [cell === KEY ? 'key' : 'value']: String.fromCharCode(A_CHAR_CODE + i)}))
            .reduce((object, part) => Object.assign(object, part), {})
        })
    }

    return this.columnsPromise
  }

  get (key) {
    return this._getColumns()
      .then(columns => {
        const k = columns.key
        const v = columns.value
        return [
          this.gsheet.readData(`${this.keyValueSheet}!${k}2:${k}500`),
          this.gsheet.readData(`${this.keyValueSheet}!${v}2:${v}500`)
        ]
      })
      .all()
      .then(([keysData, valuesData]) => {
        const index = keysData.values.map(([cell]) => cell).indexOf(key)
        return valuesData.values[index][0]
      })
  }
}