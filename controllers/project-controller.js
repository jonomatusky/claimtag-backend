const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')
const Project = require('../models/project')
const { default: sgMail } = require('../util/sendgrid')

const createProject = async (req, res, next) => {
  const owner = req.user

  // const { count } = req.body
  // let currentClaimtagCount

  // try {
  //   currentClaimtagCount = await Claimtag.countDocuments({ owner: owner.id })
  // } catch (err) {
  //   let error = new HttpError(
  //     `Sorry, we couldn't create a new claimtag. Please try again.`,
  //     500
  //   )

  //   return next(error)
  // }

  // const remainingClaimtagCount = owner.maxClaimtags - currentClaimtagCount

  // if (remainingClaimtagCount <= 0) {
  //   let error = new HttpError(
  //     `You have reached the maximum number of claimtags. Please delete some claimtags before creating more.`,
  //     401
  //   )

  //   return next(error)
  // }

  // count = Math.min(count, remainingClaimtagCount)

  let project

  try {
    if (!!owner) {
      project = await Project.create({ owner })
    } else {
      project = await Project.create()
    }
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create your claimtags. Please try again.`,
      500
    )

    return next(error)
  }

  let claimtagArray

  if (!!owner) {
    claimtagArray = Array(count).fill({ owner, project })
  } else {
    claimtagArray = Array(count).fill({ project })
  }

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

  res.status(201).json({
    project: {
      ...project.toJSON(),
      claimtags: claimtags.map(claimtag => claimtag.toJSON()),
    },
  })
}

const getProject = async (req, res, next) => {
  let { user } = req.user
  let { pid } = req.params
  let project
  let claimtags

  try {
    project = await Project.findById(pid)
  } catch (err) {
    const error = new HttpError(
      'Error accessing this resource. Please try again.',
      500
    )
    return next(error)
  }

  if (!project) {
    const error = new HttpError(
      'Error accessing this resource. Please try again.',
      404
    )
    return next(error)
  }

  if (!project.owner || user === project.owner || user.admin) {
    const query = { project: pid }

    try {
      claimtags = await Claimtag.find(query)
      res.status(201).json({
        project: {
          ...project.toJSON(),
          claimtags: claimtags.map(claimtag => claimtag.toJSON()),
        },
      })
    } catch (err) {
      const error = new HttpError(
        'There was an error retreiving the claimtags. Please try again.',
        500
      )
      return next(error)
    }
  } else {
    const error = new HttpError(
      'You do not have permission to view this resource.',
      401
    )
    return next(error)
  }
}

const deleteProject = async (req, res, next) => {
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

exports.createProject = createProject
exports.getProject = getProject
exports.deleteProject = deleteProject
