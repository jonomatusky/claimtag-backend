const mongoose = require('mongoose')

const User = require('../models/user')
const Claimtag = require('../models/claimtag')
const HttpError = require('../models/http-error')

const createMe = async (req, res, next) => {
  const { user } = req

  if (!user.id) {
    try {
      user = new User(user)
      await user.save()
    } catch (err) {
      let error = new HttpError(
        `Sorry, we couldn't create a new account. Please try again.`,
        400
      )

      if ((err.errors.fid || {}).kind === 'unique') {
        error = new HttpError('User already exists!', 400)
      }

      return next(error)
    }
  } else {
    user = reqUser
  }

  res.status(201).json({ user: user.toJSON() })
}

const getMe = async (req, res, next) => {
  let user = req.user

  if (!user) {
    const error = new HttpError(
      `Sorry, we couldn't find your account. Please try again.`,
      404
    )
    return next(error)
  }

  if (user._id) {
    res.status(201).json({ user: user.toJSON() })
  } else {
    try {
      newUser = new User(user)
      await newUser.save()
      res.status(201).json({ user: newUser.toJSON() })
    } catch (err) {
      let error = new HttpError(
        `Sorry, there was an error accessing your account. Please try again.`,
        400
      )
      return next(error)
    }
  }
}

const updateMe = async (req, res, next) => {
  let user = req.user

  const updates = req.body

  const updateKeys = Object.keys(req.body)

  const allowedUpdates = [
    'username',
    'email',
    'displayName',
    'completedSignup',
    'portal',
  ]
  const isValidOperation = updateKeys.every(update => {
    return allowedUpdates.includes(update)
  })

  if (!isValidOperation) {
    const error = new HttpError('Invalid updates.', 400)
    return next(error)
  }

  updateKeys.forEach(updateKey => (user[updateKey] = updates[updateKey]))

  try {
    await user.save()
  } catch (err) {
    let error = new HttpError(
      'Unable to update your profile. Please verify your information.',
      400
    )

    if ((err.errors.username || {}).kind === 'unique') {
      error = new HttpError(
        'Username already exists. Please select a different username.',
        400
      )
      return next(error)
    }

    if ((err.errors.email || {}).kind === 'unique') {
      error = new HttpError(
        'Email already exists. Please enter a different email address',
        400
      )
      return next(error)
    }

    return next(error)
  }

  res.status(201).json({ user: user.toJSON() })
}

const deleteMe = async (req, res, next) => {
  let { user } = req

  if (!user) {
    const error = new HttpError(
      `Sorry, we couldn't find your account. Please try again.`,
      404
    )
    return next(error)
  }
  try {
    await Claimtag.updateMany(
      { owner: user },
      { owner: user_removed, isRemoved: true }
    )
    await user.remove()
  } catch (err) {
    const error = new HttpError('Unable to remove user. Please try again.', 500)
    return next(error)
  }

  res.status(200).json({ user: user.toJSON() })
}

exports.createMe = createMe
exports.updateMe = updateMe
exports.getMe = getMe
exports.deleteMe = deleteMe
