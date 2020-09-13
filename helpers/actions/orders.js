const bfx = require('../../bitfinex/bfx')

/**
 * Set order using ws
 *
 * @param {Object} order {cid: Date, type: ORDER_TYPE, symbol: string, amount: float, price: float}
 * @memberof BitfinexConnection
 */
function setOrder(order) {
    // Set config for auth channel
    const inputPayload = [0, 'on', null, order]
    console.log(inputPayload)
    bfx.ws.send(JSON.stringify(inputPayload))
}

module.exports = {
    setOrder,
}
