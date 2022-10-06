const express = require('express')

const claimController = require('../controllers/claim-controller')

const router = express.Router()

router.post('/', claimController.create)
router.patch('/', claimController.update)

module.exports = router
