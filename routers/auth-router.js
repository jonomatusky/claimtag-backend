const express = require('express')

const claimtagController = require('../controllers/claimtag-controller')

const router = express.Router()

router.post('/linkedin/callback', claimtagController.createLinkedinCallback)

module.exports = router
