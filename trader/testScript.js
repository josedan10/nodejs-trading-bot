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
    const time1Year = 24 * 365
    let data1YearCandles
    let result
    let reorderedHistCandles4H

    // Headers
    // const headers = ['Timestamp', 'Open', 'Close', 'High', 'Low', 'Volume']
    const sheetDataParams = {
        sheetName: 'TestData',
        range: 'A2',
        majorDimension: 'ROWS',
    }

    try {
        const candles4H = await googleSheetsHandler.getEntireSheetData(
            'TestData',
            'A2:F'
        )

        if (candles4H.length === 0) {
            // Save test data on google sheets
            data1YearCandles = await bfx.getCandles(
                [null, 'BTCUSD'],
                '1h',
                time1Year
            )
            const formatedCandles1H = formatCandles(data1YearCandles)
            const candles4H = create4HCandles(formatedCandles1H)
            reorderedHistCandles4H = candles4H.reverse()
            const sheetData = reorderedHistCandles4H.map((candle) => [
                candle.timestamp,
                candle.open,
                candle.close,
                candle.high,
                candle.low,
                candle.volume,
            ])

            result = await googleSheetsHandler.updateSheet(
                sheetData,
                sheetDataParams
            )
        } else {
            reorderedHistCandles4H = formatCandles(candles4H)
        }

        // await googleSheetsHandler.updateSheet(headers, sheetParams)
    } catch (err) {
        console.log(err)
        throw Error('[ Error in Test ] :' + err.toString())
    } finally {
        // Set initial state
        trader.status.amount = trader.status.initialAmount = parseFloat(
            req.query.amount
        )

        // Test strategy with Test Data
        for (let i = 0; i < reorderedHistCandles4H.length - 40; i++) {
            const resultStatus = trader.runStrategy(
                reorderedHistCandles4H.slice(i, i + 40)
            )

            if (
                resultStatus.signal === 'Sell' &&
                trader.status.position === 'In'
            )
                await trader.executeTestSellOrder(resultStatus)
            else if (
                resultStatus.signal === 'Bought' &&
                trader.status.position === 'Out'
            )
                await trader.executeTestBuyOrder(resultStatus)
            else if (resultStatus.moveStopLoss)
                trader.moveStopLoss(resultStatus)
        }

        res.send(result)
    }
}

module.exports = test
