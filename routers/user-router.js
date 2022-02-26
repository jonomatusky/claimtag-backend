const express = require('express')

const { adminAuth } = require('../middleware/auth')
const userController = require('../controllers/user-controller')

const router = express.Router()

router.get('/', adminAuth, userController.getUsers)

router.post('/', adminAuth, userController.createUser)

router.get('/:uid', adminAuth, userController.getUser)

router.patch('/:uid', adminAuth, userController.updateUser)

router.delete('/:uid', adminAuth, userController.deleteUser)

module.exports = router
