const HttpError = require('../models/http-error')
const User = require('../models/user')
var admin = require('firebase-admin')

const getToken = req => {
  try {
    let token = req.headers.authorization.split(' ')[1]
    return token
  } catch (err) {
    return new Error(`Unable to get token from header`)
  }
}

const verifyToken = async token => {
  try {
    let decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken
  } catch (err) {
    return new Error(`Unable to verify token`)
  }
}

const getUser = async decodedToken => {
  const { uid: fid } = decodedToken
  let user

  if (fid) {
    try {
      user = await User.findOne({ fid })
    } catch (err) {
      const error = new HttpError(
        'Unable to connect to server. Please try again.',
        500
      )
      throw error
    }
  }

  return user
}

const id = async (req, res, next) => {
  let token = getToken(req)
  const decodedToken = await verifyToken(token)

  if (token) {
    req.token = token

    let user

    try {
      user = await getUser(decodedToken)
    } catch (err) {}

    req.user = user
  }

  return next()
}

const verify = async (req, res, next) => {
  let token = getToken(req)

  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  const verified = await verifyToken(token)

  if (!verified) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  req.token = token
  next()
}

const auth = async (req, res, next) => {
  let token = getToken(req)

  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  const { verified, decodedToken } = await verifyToken(token)

  if (!verified) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  req.token = token

  let user

  try {
    user = await getUser(decodedToken)
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Unable to connect to server. Please try again.',
      500
    )
    return next(error)
  }

  req.user = user
  req.token = token

  return next()
}

const adminAuth = async (req, res, next) => {
  let token = getToken(req)

  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  //isDepricated shows if this is a request from Plynth 1.0
  const { verified, decodedToken } = await verifyToken(token)

  if (!verified) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  req.token = token

  let user

  try {
    user = await getUser(decodedToken)
  } catch (err) {
    const error = new HttpError(
      'Unable to connect to server. Please try again.',
      500
    )
    return next(error)
  }

  if (!(user || {}).admin) {
    const error = new HttpError(
      'You are not authorized to access this route.',
      403
    )
    return next(error)
  }

  req.user = user
  next()
}

exports.id = id
exports.verify = verify
exports.auth = auth
exports.adminAuth = adminAuth
