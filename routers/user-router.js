const express = require('express')

const { auth, adminAuth, newUserAuth, verify } = require('../middleware/auth')
const userController = require('../controllers/user-controller')

const router = express.Router()

router.get('/', adminAuth, userController.getUsers)

router.post('/', adminAuth, userController.createUser)

router.get('/:uid', userController.getUser)

router.patch('/:uid', auth, userController.updateUser)

router.delete('/:uid', adminAuth, userController.deleteUser)

module.exports = router
