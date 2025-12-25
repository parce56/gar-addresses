const express = require('express')
const router = express.Router()
const admAddressController = require('../controllers/admAddressController')

router.get('/admAddresses', admAddressController.getAdmAddresses)

module.exports = router