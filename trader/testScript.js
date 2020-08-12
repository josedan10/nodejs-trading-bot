const bfx = require('../bitfinex/bfx')
const googleSheetsHandler = require('../helpers/google/sheets')
const { formatCandles, create4HCandles } = require('../helpers/candlesHelper')
const trader = require('.')

/**
 * Test Strategy
 *
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */
async function test(req, res) {
    try {
        const time1Year = 24 * 365
        const data1YearCandles = await bfx.getCandles(
            [null, 'BTCUSD'],
            '1h',
            time1Year
        )

        // Set initial state
        trader.status.amount = trader.status.initialAmount = parseFloat(
            req.query.amount
        )

        // Headers
        // const headers = ['Timestamp', 'Open', 'Close', 'High', 'Low', 'Volume']
        const sheetParams = {
            sheetName: 'TestData',
            range: 'A2',
            majorDimension: 'ROWS',
        }

        // await googleSheetsHandler.updateSheet(headers, sheetParams)

        // Save test data on google sheets
        const formatedCandles1H = formatCandles(data1YearCandles)
        const candles4H = create4HCandles(formatedCandles1H)
        const sheetData = candles4H
            .reverse()
            .map((candle) => [
                candle.timestamp,
                candle.open,
                candle.close,
                candle.high,
                candle.low,
                candle.volume,
            ])

        const result = await googleSheetsHandler.updateSheet(
            sheetData,
            sheetParams
        )

        res.send(result)

        // Execute strategy
        // const testArray = []

        // if (testArray.length < 40) {
        //     testArray.push(row)
        // } else {
        //     const { position } = trader.status
        //     const strategyResult = trader.runStrategyTest(testArray)

        //     if (strategyResult.signal === 'Sell' && position === 'In')
        //         await trader.executeSellOrder(strategyResult)

        //     else if (strategyResult.signal === 'Bought' && position === 'Out')
        //         await trader.executeBuyOrder(strategyResult)

        //     testArray.shift()
        //     testArray.push()
        // }
    } catch (err) {
        res.send(err)
        throw Error('[ Error in Test ] :' + err.toString())
    }
}

module.exports = test
