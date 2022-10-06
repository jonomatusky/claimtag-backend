const express = require('express')

const controller = require('../controllers/temp-user-controller')

const router = express.Router()

router.get('/:id', controller.get)

module.exports = router
