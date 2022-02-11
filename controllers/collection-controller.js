const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')

const createCollection = async (req, res, next) => {
  const owner = req.user

  const { count } = req.body
  let currentClaimtagCount

  try {
    currentClaimtagCount = await Claimtag.countDocuments({ owner: owner.id })
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create a new claimtag. Please try again.`,
      500
    )

    return next(error)
  }

  const remainingClaimtagCount = owner.maxClaimtags - currentClaimtagCount

  if (remainingClaimtagCount <= 0) {
    let error = new HttpError(
      `You have reached the maximum number of claimtags. Please delete some claimtags before creating more.`,
      401
    )

    return next(error)
  }

  count = Math.min(count, remainingClaimtagCount)

  const claimtagArray = Array(count).fill({ owner })
  let claimtags

  try {
    claimtags = await Claimtag.insertMany(claimtagArray)
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create your claimtags. Please try again.`,
      500
    )

    return next(error)
  }

  res
    .status(201)
    .json({ claimtags: claimtags.map(claimtag => claimtag.toJSON()) })
}

const getCollection = async (req, res, next) => {
  let user = req.user

  let query = req.query || {}
  query.owner = user

  try {
    const claimtags = await Claimtag.find(query)
    res
      .status(201)
      .json({ claimtags: claimtags.map(claimtag => claimtag.toJSON()) })
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving the claimtags. Please try again.',
      500
    )
    return next(error)
  }
}

const deleteCollection = async (req, res, next) => {
  const query = req.query || {}
  const { claimed } = query

  const owner = req.user

  try {
    if (claimed) {
      await Claimtag.deleteMany({ owner, url: { $exists: claimed } })
    } else {
      await Claimtag.deleteMany({ owner })
    }
  } catch (err) {
    const error = new HttpError(
      'There was an error deleting your claimtags. Please try again.',
      500
    )
    return next(error)
  }
}

exports.createCollection = createCollection
exports.getCollection = getCollection
exports.deleteCollection = deleteCollection
