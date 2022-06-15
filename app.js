const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var admin = require('firebase-admin')

const userRouter = require('./routers/user-router')
const meRouter = require('./routers/me-router')
const claimtagRouter = require('./routers/claimtag-router')
const projectRouter = require('./routers/project-router')
const projectEmailRouter = require('./routers/project-email-router')
const inquiryRouter = require('./routers/inquiry-router')

const { sgMail } = require('./util/sendgrid')

const HttpError = require('./models/http-error')

const app = express()

const { PORT, DB_USER, DB_PASSWORD, DB_URL, DB_NAME, SENDGRID_API_KEY } =
  process.env

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
})

sgMail.setApiKey(SENDGRID_API_KEY)

const port = PORT || 5000

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Request-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  console.log(req.originalUrl, req.method)
  next()
})

app.use('/api/users', userRouter)

app.use('/api/me', meRouter)

app.use('/api/claimtags', claimtagRouter)

app.use('/api/projects', projectRouter)

app.use('/api/project-emails', projectEmailRouter)

app.use('/api/inquiries', inquiryRouter)

app.use((req, res, next) => {
  const error = new HttpError(`Sorry, we can seem to find this resource.`, 404)
  throw error
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }

  console.log(error)

  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred' })
})

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port)
  })
  .catch(err => {
    console.log(err)
  })
