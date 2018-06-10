#!/usr/bin/env node
'use strict'

const { defineCli } = require('./lib/cli')
const { dependencies } = require('./dependencies')

defineCli(dependencies)
  .parse(process.argv)