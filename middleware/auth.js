const HttpError = require('../models/http-error')
const User = require('../models/user')
var admin = require('firebase-admin')

const getToken = req => {
  return req.headers.authorization.split(' ')[1]
}

const verifyToken = async token => {
  let decodedToken = await admin.auth().verifyIdToken(token)
  return decodedToken
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
  let token
  let decodedToken
  let user

  try {
    token = getToken(req)
  } catch (err) {
    return next()
  }

  if (!token) return next()

  req.token = token

  try {
    decodedToken = await verifyToken(token)
  } catch (err) {
    return next()
  }

  if (!decodedToken) return next()

  try {
    user = await getUser(decodedToken)
  } catch (err) {
    return next()
  }

  if (!user) return next()

  req.user = user

  return next()
}

const auth = async (req, res, next) => {
  let token

  try {
    token = getToken(req)
  } catch (err) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

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
