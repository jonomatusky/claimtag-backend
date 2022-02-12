const express = require('express')

const claimtagController = require('../controllers/claimtag-controller')

const router = express.Router()

router.post('/', claimtagController.createClaimtag)
router.get('/:cid', claimtagController.getClaimtag)
router.patch('/:cid', claimtagController.claimClaimtag)
router.delete('/:cid', claimtagController.deleteClaimtag)

module.exports = router
