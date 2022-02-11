const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')

const createClaimtag = async (req, res, next) => {
  const owner = req.user
  let claimtag = new Claimtag({ owner })

  try {
    await claimtag.save()
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create a new claimtag. Please try again.`,
      500
    )

    return next(error)
  }

  res.status(201).json({ claimtag: claimtag.toJSON() })
}

const getClaimtag = async (req, res, next) => {
  const { claimtagId } = req.params

  let claimtag

  try {
    claimtag = await Claimtag.findOne({ claimtagId })
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving this claimtag. Please try again.',
      500
    )
    return next(error)
  }

  if (!claimtag) {
    const error = new HttpError(
      'This claimtag has not been created yet or has been deleted. Please try a different claimtag.',
      404
    )
  }

  if (claimtag && !claimtag.url) {
    return res.status(201).json({ claimtag: { status: 'unclaimed' } })
  }

  return res.status(201).json({ claimtag: claimtag.toJSON() })
}

const claimClaimtag = async (req, res, next) => {
  const { id, url } = req.body
  let claimtag

  try {
    claimtag = await Claimtag.findById(id)
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

  if (!!claimtag.url) {
    let error = new HttpError(
      `Sorry, this claimtag has already been claimed. Please try a different claimtag.`,
      401
    )
    return next(error)
  }

  claimtag.url = url

  try {
    await claimtag.save()
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't claim this claimtag. Please try again.`,
      500
    )
    return next(error)
  }

  res.status(201).json({ claimtag: claimtag.toJSON() })
}

const deleteClaimtag = async (req, res, next) => {
  try {
    await Claimtag.findByIdAndDelete(req.params.id)
  } catch (err) {
    const error = new HttpError(
      'There was an error deleting the claimtag. Please try again.',
      500
    )
    return next(error)
  }
}

exports.createClaimtag = createClaimtag
exports.getClaimtag = getClaimtag
exports.claimClaimtag = claimClaimtag
exports.deleteClaimtag = deleteClaimtag