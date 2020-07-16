/**
 *  Format candles as objects
 *
 * @param {Array} data
 * @return {Array}
 */
const formatCandles = (data) =>
    data.map((candle) => ({
        timestamp: candle[0] / 100,
        open: candle[1],
        close: candle[2],
        high: candle[3],
        low: candle[4],
        volume: candle[5],
    }))

/**
 *  Build 4Hrs candles from formated candles array
 *
 * @param {Array} data formated 1H candles
 */
const create4HCandles = (data) => {
    const array4h = []
    let candle

    for (let i = 0; i < data.length; i += 4) {
        // Copy the candle
        candle = { ...data[i] }
        candle.close = data[i + 4].close

        // Iterate candles group
        data.slice([i + 1, i + 4]).forEach((c) => {
            // Set highest price
            if (c.high > candle.high) candle.high = c.high
            // Set lowest price
            if (c.low < candle.low) candle.low = c.low
            // Sum volumes
            candle.volume += c.volume
        })

        array4h.push(candle)
    }
}

module.exports = {
    formatCandles,
    create4HCandles,
}
