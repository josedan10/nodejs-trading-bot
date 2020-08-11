const sma = require('../indicators/sma')

/**
 *  This function execute the adeline bot trading strategy
 *  The bot start a long trade when the SMA(10) cross SMA(40) from bottom
 *  The bot start a short trade when the SMA(10) cross SMA(40) from top
 *
 * @param {Array} data candles array
 * @param {String} symbol
 * @param {Object} status
 *
 * @return {Object} status
 * {
 *  position: status of the signal
 *  price: price of the signal
 *  timestamp: time
 * }
 */
function adeline(data, symbol, status) {
    const sma40 = sma(data, 40)
    const sma10 = sma(data, 10)

    const response = {
        price: 0,
        timestamp: null,
        signal: null,
    }

    if (sma40 < sma10 && status.position === 'Out') {
        // Buy signal
        // Only buy when the bot is inside a long trade.
        response.signal = 'Bought'
        response.price = data[0].close
        response.timestamp = data[0].timestamp
    } else {
        // Sell signal
        response.signal = 'Sell'
        response.price = data[0].close
        response.timestamp = data[0].timestamp
    }

    // Save data on google sheets here
    return response
}

module.exports = adeline