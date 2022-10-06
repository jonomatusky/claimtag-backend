const mongoose = require('mongoose')

const Claimtag = require('../models/claimtag')
const Scan = require('../models/scan')
const TempUser = require('../models/tempUser')
const { getClaimtags } = require('./my-claimtag-controller')
const HttpError = require('../models/http-error')

const get = async (req, res, next) => {
  const id = req.params.id
  // let user

  // try {
  //   user = await TempUser.findById(id)
  // } catch (err) {
  //   const error = new HttpError(
  //     'There was an error retreiving the user. Please try again.',
  //     404
  //   )
  //   return next(error)
  // }

  // if (!user) {
  //   const error = new HttpError(
  //     'Could not find a user for the provided id.',
  //     404
  //   )
  //   return next(error)
  // }

  let claimtag

  try {
    claimtag = await Claimtag.findOne({ tempUser: id })
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving your account. Please try again.',
      404
    )
    return next(error)
  }

  if (!claimtag) {
    const error = new HttpError(
      'There was an error retreiving your account. Please try again.',
      404
    )
    return next(error)
  }

  let scans = []

  try {
    scans = await Scan.find(
      {
        $or: [{ tempUser: id }, { claimtag: claimtag.id }],
      },
      {},
      { sort: { createdAt: -1 } }
    ).populate('claimtag')
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving your account. Please try again.',
      404
    )
    return next(error)
  }

  res.status(200).json({
    claimtag: claimtag.toJSON(),
    scans: scans.map(scan => scan.toJSON()),
  })
}

exports.get = get
