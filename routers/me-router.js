const express = require('express')

const { auth, id } = require('../middleware/auth')
const meController = require('../controllers/me-controller')
const myProjectController = require('../controllers/my-project-controller')

const router = express.Router()

router.get('/', id, meController.getMe)

router.post('/', auth, meController.createMe)

router.patch('/', auth, meController.updateMe)

router.delete('/', auth, meController.deleteMe)

router.post('/projects', id, myProjectController.createProject)

router.get('/projects', auth, myProjectController.getProjects)

router.get('/projects/:cid', auth, myProjectController.getProject)

router.delete('/projects/:cid', auth, myProjectController.deleteProject)

router.get('/projects/:cid/claimtags', auth, myProjectController.getClaimtags)

module.exports = router
