'use strict'

const express = require('express')
const morgan = require('morgan')

const { routerFactory } = require('./lib/router')
const { dependencies } = require('./dependencies')

const router = routerFactory(dependencies)

const app = express()

app.use(morgan(process.env.MORGAN_FORMAT))
app.use(router)
app.listen(process.env.PORT)