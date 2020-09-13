/**
 *  Format candles as objects
 *
 * @param {Array} data
 * @return {Array}
 */
const formatCandles = (data) =>
    data.map((candle) => ({
        timestamp: parseFloat(candle[0]),
        open: parseFloat(candle[1]),
        close: parseFloat(candle[2]),
        high: parseFloat(candle[3]),
        low: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
    }))

/**
 *  Build 4Hrs candles from formated candles array
 *
 * @param {Array} data formated 1H candles
 * @return {Array}
 */
const create4HCandles = (data) => {
    const array4h = []
    let candle

    try {
        for (let i = 0; i < data.length; i += 4) {
            // Copy the candle
            candle = { ...data[i] }
            candle.close = data[i + 3].close

            // Iterate candles group
            data.slice(i + 1, i + 4).forEach((c) => {
                // Set highest price
                if (c.high > candle.high) candle.high = c.high
                // Set lowest price
                if (c.low < candle.low) candle.low = c.low
                // Sum volumes
                candle.volume += c.volume
            })

            array4h.push(candle)
        }

        return array4h
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    formatCandles,
    create4HCandles,
}
