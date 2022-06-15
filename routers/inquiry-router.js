const express = require('express')
const router = express.Router()

const controller = require('../controllers/inquiry-controller')

router.post('/', controller.create)

module.exports = router
