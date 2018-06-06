'use strict'

const USERS_KEY = 'users'

exports.UserManager = class {

  constructor (options) {
    this.keyValueStore = options.keyValueStore
  }

  _getUsers() {
    if (!this._usersPromise) {
      this._usersPromise = this.keyValueStore.get(USERS_KEY)
        .then(JSON.parse)
    }

    return this._usersPromise
  }

  getUser(alias) {
    const lowerAlias = alias.toLowerCase()

    return this._getUsers()
      .then(users => users.find(u => u.name.toLowerCase() === lowerAlias || u.aliases.includes(lowerAlias)))
      .then(u => Object.freeze(u))
  }

}