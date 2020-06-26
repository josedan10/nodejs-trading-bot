const { default: Axios } = require('axios')
const { bitfinex } = require('../../config')
const path = require('path')

const express = require('express')
const router = new express.Router()

router.get('/chart', async (req, res) => {
    try {
        const { limit } = req.query
        const response = await Axios.get(
            `${bitfinex.bitfinexRESTPublicURL}/candles/trade:3h:tBTCUSD/hist`,
            {
                params: {
                    limit: limit || 120,
                },
            }
        )
        res.send(JSON.stringify(response.data))
    } catch (err) {
        console.log(err)
        res.status(500).send('Error: ' + err.toString())
    }
})

router.get('/screenshot', async (req, res) => {
    try {
        const { fileName } = req.query
        const file = path.resolve(fileName)

        res.sendFile(file)
    } catch (err) {
        throw Error(
            `[Screenshot File] Error trying to get file ${filename}: ${err.toString()}`
        )
    }
})

module.exports = router
