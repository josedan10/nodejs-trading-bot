// const axios = require('axios')

/**
 * Set the order in the bitfinex exchange passing as body variables the amount, the symbol, the price, and type of order
 *
 * @param {*} req
 * @param {*} res
 */
function setOrder(req, res) {
    try {
        // const { orderType, price, symbol, amount } = req.body

        res.sendStatus(200)
    } catch (err) {
        res.status(500).send(err)
        throw Error(`[Setting order]: ${err}`)
    }
}

module.exports = {
    setOrder,
}
