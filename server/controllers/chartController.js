const { default: Axios } = require('axios')
const { bitfinex } = require('../../config')
const path = require('path')

/**
 * Send data info from bitfinex API
 *
 * @param {Request} req
 * @param {Response} res
 */
async function chartData(req, res) {
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
}

/**
 * Take screenshot from client app
 *
 * @param {Request} req
 * @param {Response} res
 */
async function takeScreenshot(req, res) {
    try {
        const { fileName } = req.query
        const file = path.resolve(fileName)

        res.sendFile(file)
    } catch (err) {
        throw Error(
            `[Screenshot File] Error trying to get file ${filename}: ${err.toString()}`
        )
    }
}

module.exports = {
    chartData,
    takeScreenshot,
}
