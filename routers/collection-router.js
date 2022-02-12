const express = require('express')

const collectionController = require('../controllers/collection-controller')

const router = express.Router()

router.post('/', collectionController.createCollection)
router.get('/:cid', collectionController.getCollection)
router.delete('/:cid', collectionController.deleteCollection)

module.exports = router
