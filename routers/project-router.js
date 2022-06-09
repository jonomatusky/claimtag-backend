const express = require('express')

const projectController = require('../controllers/project-controller')
const { id, adminAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/', id, projectController.createProject)
router.get('/:id', projectController.getProject)
router.delete('/:id', adminAuth, projectController.deleteProject)

module.exports = router
