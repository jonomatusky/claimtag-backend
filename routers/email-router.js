const express = require('express')
const router = express.Router()

const controller = require('../controllers/email-controller')

router.post('/', controller.create)
router.post('/:cid/update', controller.sendUpdateEmail)

module.exports = router
