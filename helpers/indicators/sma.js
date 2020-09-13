/**
 * Calculates the standard moving average
 * By default it use the close price
 *
 * @param {Array} data
 * @param {Integer} range
 * @param {string} [option='close']
 *
 * @return {Float} sma value
 */
module.exports = function (data, range, option = 'close') {
    let sma = 0

    // slice array
    data = data.slice(0, range)

    data.forEach((candle) => (sma += parseFloat(candle[option])))
    return sma / data.length
}
