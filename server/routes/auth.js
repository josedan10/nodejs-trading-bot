const express = require('express')
const router = new express.Router()

const { googleSheetsOAuth } = require('../controllers/sheetsController')

router.get('/google-sheets', googleSheetsOAuth)

module.exports = router
