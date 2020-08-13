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
    // I must sort data from new to old
    if (data[0].timestamp < data[1].timestamp) {
        data = data.reverse()
    }

    const sma40 = sma(data, 40)
    const sma10 = sma(data, 10)

    const response = {
        price: 0,
        timestamp: null,
        signal: null,
        moveStopLoss: false,
    }

    if (sma40 < sma10 && status.position === 'Out') {
        // Buy signal
        // Only buy when the bot is inside a long trade.
        response.signal = 'Bought'
        response.price = parseFloat(data[0].close)
        response.timestamp = parseInt(data[0].timestamp)
    } else if (sma40 > sma10 && status.position === 'In') {
        // Sell signal
        response.signal = 'Sell'
        response.price = data[0].close
        response.timestamp = data[0].timestamp
    }

    // Stop Loss handler

    if (status.position === 'In') {
        // Stop loss price reached
        if (data[0].close <= status.stopLossPrice) {
            // Sell signal
            response.signal = 'Sell'
            response.price = status.stopLossPrice
            response.timestamp = data[0].timestampfi
        } else if (data[0].close > status.stopLossPrice) {
            const diff = data[0].close - status.stop

            // Move stop loss price
            if (diff > status.stopLossPrice * status.moveStopLossPercentage) {
                response.moveStopLoss = true
                response.price = data[0].close
            }
        }
    }

    // Save data on google sheets here
    return response
}

module.exports = adeline
