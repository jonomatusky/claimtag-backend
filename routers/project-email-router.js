const express = require('express')

const projectEmailController = require('../controllers/project-email-controller')
const { id, adminAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/:pid', id, projectEmailController.sendProjectEmail)

module.exports = router
