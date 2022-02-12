const express = require('express')

const { auth } = require('../middleware/auth')
const meController = require('../controllers/me-controller')

const router = express.Router()

router.get('/me', auth, meController.getMe)

router.post('/me', auth, meController.createMe)

router.patch('/me', auth, meController.updateMe)

router.delete('/me', auth, meController.deleteMe)

module.exports = router
