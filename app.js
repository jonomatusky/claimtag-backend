const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var admin = require('firebase-admin')

const userRouter = require('./routers/user-router')
const meRouter = require('./routers/me-router')
const claimtagRouter = require('./routers/claimtag-router')
const collectionRouter = require('./routers/collection-router')

const HttpError = require('./models/http-error')

const app = express()

const { PORT, DB_USER, DB_PASSWORD, DB_URL, DB_NAME } = process.env

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
})

const port = PORT || 5000

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Request-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  next()
})

app.use('/api/users', userRouter)

app.use('/api/me', meRouter)

app.use('/api/pieces', claimtagRouter)

app.use('/api/collections', collectionRouter)

app.use((req, res, next) => {
  const error = new HttpError(`Sorry, we can seem to find this page.`, 404)
  throw error
})

app.use((error, req, res, next) => {
  // if (req.file) {
  //   fs.unlink(req.file.path, () => {
  //     console.log(error)
  //   })
  // }

  if (res.headerSent) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred' })
  console.log(error.message)
})

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(port)
  })
  .catch(err => {
    console.log(err)
  })
