const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Claimtag = require('../models/claimtag')
const Project = require('../models/project')

const { MAX_ANON_CT, MAX_CT } = process.env

const createProject = async (req, res, next) => {
  const owner = req.user
  const { count } = req.body

  console.log(count)

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
    project = new Project({ owner })
    project.save()
  } catch (err) {
    let error = new HttpError(
      `Sorry, we couldn't create your claimtags. Please try again.`,
      500
    )

    return next(error)
  }

  let claimtagArray
  if (!!owner) {
    claimtagArray = new Array(count || parseInt(MAX_CT)).fill({
      owner,
      project,
    })
  } else {
    claimtagArray = new Array(parseInt(MAX_ANON_CT)).fill({ project })
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
  let { user } = req

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

const getProjects = async (req, res, next) => {
  const user = req.user

  try {
    const projects = await Project.find({ owner: user.id }, null, {
      sort: '-createdAt',
    })
    res
      .status(201)
      .json({ projects: projects.map(project => project.toJSON()) })
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving your projects. Please try again.',
      500
    )
    return next(error)
  }
}

const deleteProject = async (req, res, next) => {
  const cid = req.params.cid

  try {
    await Project.findOneAndDelete({ _id: cid, owner: req.user })
    await Claimtag.deleteMany({ owner, project: cid })
  } catch (err) {
    const error = new HttpError(
      'There was an error deleting these claimtags. Please try again.',
      500
    )
    return next(error)
  }
}

const getClaimtags = async (req, res, next) => {
  const { cid } = req.params

  try {
    const claimtags = await Claimtag.find({ project: cid })
    res
      .status(201)
      .json({ claimtags: claimtags.map(claimtag => claimtag.toJSON()) })
  } catch (err) {
    const error = new HttpError(
      'There was an error retreiving these claimtags. Please try again.',
      500
    )
    return next(error)
  }
}

exports.createProject = createProject
exports.getProject = getProject
exports.getProjects = getProjects
exports.getClaimtags = getClaimtags
exports.deleteProject = deleteProject
