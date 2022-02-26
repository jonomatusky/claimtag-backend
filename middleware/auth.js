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
  const { uid: fid, email } = decodedToken
  let user = { fid }

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

  if (!user) {
    user = { fid }
  }

  if (!!email) {
    user.email = email
  }

  return user
}

const id = async (req, res, next) => {
  let token = getToken(req)

  if (token) {
    let decodedToken
    req.token = token
    let user

    try {
      decodedToken = await verifyToken(token)
    } catch (err) {
      const error = new HttpError('Unable to verify user.', 500)
      return next(error)
    }

    if (!decodedToken) {
      const error = new HttpError('Unable to verify user.', 500)
      return next(error)
    }

    try {
      user = await getUser(decodedToken)
    } catch (err) {}

    req.user = user
  }

  return next()
}

const auth = async (req, res, next) => {
  let token = getToken(req)

  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  const decodedToken = await verifyToken(token)

  if (!decodedToken) {
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
exports.auth = auth
exports.adminAuth = adminAuth
