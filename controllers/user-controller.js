const mongoose = require('mongoose')

const User = require('../models/user')
const Claimtag = require('../models/claimtag')

const createUser = async (req, res, next) => {
  let user

  try {
    user = new User({ ...req.user, ...req.body })
    await user.save()
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create a new account. Please try again.`,
      400
    )

    return next(error)
  }

  res.status(201).json({ user: user.toJSON() })
}

const getUser = async (req, res, next) => {
  const uid = req.params.uid
  let user

  try {
    user = await User.findById(uid)
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving the user. Please try again.',
      404
    )
    return next(error)
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id.',
      404
    )
    return next(error)
  }

  const userData = user.toJSON()

  res.status(200).json({ user: userData })
}

const updateUser = async (req, res, next) => {
  const uid = req.params.uid
  let reqUser = req.user
  let user

  if (!reqUser.admin) {
    const error = new HttpError(
      'You are not authorized to edit this user.',
      401
    )
    return next(error)
  }

  try {
    user = await User.findById(urd)
  } catch (err) {
    const error = new HttpError(
      'There was an error retrieving the user. Please try again.',
      404
    )
    return next(error)
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id.',
      404
    )
    return next(error)
  }

  const updates = req.body
  const updateKeys = Object.keys(updates)

  updateKeys.forEach(updateKey => (user[updateKey] = updates[updateKey]))

  try {
    await user.save()
  } catch (err) {
    const error = new HttpError(
      'There was an error updaring the user. Please try again.',
      500
    )
    return next(error)
  }

  res.status(201).json({ user: user.toJSON() })
}

const deleteUser = async (req, res, next) => {
  const { uid } = req.params

  try {
    user = await User.findById(uid)
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving the user. Please try again.',
      404
    )
    return next(error)
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id.',
      404
    )
    return next(error)
  }

  try {
    await Claimtags.deleteMany({ owner: user })

    await user.remove()
  } catch (err) {
    const error = new HttpError('Unable to remove user. Please try again.', 500)
    return next(error)
  }

  res.status(200).json({ user: user.toJSON() })
}

const getUsers = async (req, res, next) => {
  let users

  const skip =
    req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0

  try {
    users = await User.find({}, null, {
      sort: '-updatedAt',
    }).exec()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not retrieve users',
      500
    )
    return next(error)
  }

  const responseData = {
    users: users.map(user => user.toJSON()),
  }

  res.status(200).json(responseData)
}

exports.createUser = createUser
exports.getUser = getUser
exports.updateUser = updateUser
exports.deleteUser = deleteUser
exports.getUsers = getUsers
