const express = require('express')

const claimtagController = require('../controllers/claimtag-controller')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

router.post('/', adminAuth, claimtagController.createClaimtag)
router.get('/:path', claimtagController.getClaimtag)
router.patch('/:path', claimtagController.claimClaimtag)
router.put('/:id', claimtagController.updateClaimtag)
router.delete('/:cid', adminAuth, claimtagController.deleteClaimtag)

module.exports = router
