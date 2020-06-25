const { default: Axios } = require('axios')
const { bitfinex } = require('../../config')

const express = require('express')
const router = new express.Router()

router.get('/chart', async (req, res) => {
    try {
        const response = await Axios.get(
            `${bitfinex.bitfinexRESTPublicURL}/candles/trade:3h:tBTCUSD/hist`
        )
        res.send(JSON.stringify(response.data))
    } catch (err) {
        console.log(err)
        res.status(500).send('Error: ' + err.toString())
    }
})

module.exports = router
