const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')
const TempUser = require('../models/tempUser')
const { default: base64url } = require('base64url')

const create = async (req, res, next) => {
  const { path, url, profile, createUserId } = req.body
  let claimtag
  let id

  if (!path) {
    const error = new HttpError(
      'There was an error retreiving this claimtag. Please try again.',
      500
    )
    return next(error)
  }

  if (path.length === 24) {
    id = path
  } else {
    try {
      id = base64url.decode(path, 'hex')
    } catch (err) {
      console.log(err)
      const error = new HttpError(
        'There was an error retreiving this claimtag. Please try again.',
        500
      )
      return next(error)
    }
  }

  try {
    claimtag = await Claimtag.findById(id)
  } catch (err) {
    console.log(err)
    let error = new HttpError(
      `Sorry, we couldn't create a new claimtag. Please try again.`,
      500
    )
    return next(error)
  }

  if (!claimtag) {
    let error = new HttpError(
      `Sorry, could not claimt this Claimtage. Please try another one.`,
      404
    )
    return next(error)
  }

  let user

  claimtag.url = url
  claimtag.profile = profile

  if (createUserId) {
    try {
      let tempUser = new TempUser()
      await tempUser.save()
      user = tempUser.toJSON()
      claimtag.tempUser = user.id
    } catch (err) {
      console.log(err)
    }
  }

  try {
    await claimtag.save()
  } catch (err) {
    console.log(err)
    let error = new HttpError(
      `Sorry, we couldn't claim this claimtag. Please try again.`,
      500
    )
    return next(error)
  }

  res.status(201).json({ claimtag: claimtag.toJSON(), user })
}

const update = async (req, res, next) => {
  const { id, url } = req.body
  let claimtag

  if (!id || !url) {
    const error = new HttpError(
      'There was an error updating this claimtag. Please try again.',
      500
    )
  }

  try {
    claimtag = await Claimtag.findOne({ tempUser: id })
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create a new claimtag. Please try again.`,
      500
    )
    return next(error)
  }

  if (!claimtag) {
    let error = new HttpError(
      `Sorry, this claimtag has not been created yet or has been deleted. Please try a different claimtag.`,
      404
    )
    return next(error)
  }

  claimtag.url = url

  try {
    await claimtag.save()
  } catch (err) {
    console.log(err)
    let error = new HttpError(
      `Sorry, we couldn't claim this claimtag. Please try again.`,
      500
    )
    return next(error)
  }

  res.status(201).json({ claimtag: claimtag.toJSON() })
}

exports.create = create
exports.update = update
