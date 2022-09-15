const HttpError = require('../models/http-error')
const User = require('../models/user')
const admin = require('firebase-admin')

const getToken = req => {
  return req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : null
}

const verifyToken = async token => {
  let decodedToken = await admin.auth().verifyIdToken(token)
  return decodedToken
}

const getUser = async decodedToken => {
  const { uid: fid, email } = decodedToken
  let user

  if (!fid) {
    const error = new HttpError('Unable to find user.', 401)
    throw error
  }

  // get the user from the database
  try {
    user = await User.findOne({ fid })
      // .populate('uploadedExperienceCount')
      .exec()
  } catch (err) {
    const error = new HttpError(
      'Unable to connect to server. Please try again.',
      500
    )
    throw error
  }

  // if no user is found, create one
  if (!user) {
    try {
      user = new User({ fid, email: email })
      await user.save()
    } catch (err) {
      let error = new HttpError(
        `Sorry, we couldn't create a new account. Please try again.`,
        400
      )

      throw error
    }
  }

  if (user.email !== email) {
    user.email = email
    try {
      await user.save()
    } catch (err) {
      let error = new HttpError(
        `Sorry, there was an error retrieving the user.`,
        400
      )

      throw error
    }
  }

  if (!user) {
    const error = new HttpError('Unable to find user.', 401)
    throw error
  }

  // add email from firebase to the user
  user.email = email

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

  // get the user token from the request header
  try {
    token = getToken(req)
  } catch (err) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  // if no token is found, return an error
  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  // if token is found, verify it
  const decodedToken = await verifyToken(token)

  // if token is invalid, return an error
  if (!decodedToken) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  // if token is valid, get the user
  req.token = token

  let user

  try {
    user = await getUser(decodedToken)
  } catch (error) {
    return next(error)
  }

  req.user = user
  req.token = token

  return next()
}

const adminAuth = async (req, res, next) => {
  let token

  // get the user token from the request header
  try {
    token = getToken(req)
  } catch (err) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  // if no token is found, return an error
  if (!token) {
    const error = new HttpError('Please log in to continue.', 401)
    return next(error)
  }

  // if token is found, verify it
  const decodedToken = await verifyToken(token)

  // if token is invalid, return an error
  if (!decodedToken) {
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
