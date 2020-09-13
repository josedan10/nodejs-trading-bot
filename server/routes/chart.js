const { chartData, takeScreenshot } = require('../controllers/chartController')

const express = require('express')
const router = new express.Router()

router.get('/chart', chartData)

router.get('/screenshot', takeScreenshot)

module.exports = router
