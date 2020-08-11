const CreateCsvWriter = require('csv-writer').createObjectCsvWriter
const csvParser = require('csv-parser')
const fs = require('fs')
const bfx = require('../bitfinex/bfx')
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

        // Save test data on google sheets
        const csvWriter = new CreateCsvWriter({
            path: './testData.csv',
            header: [
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'open', title: 'Open' },
                { id: 'close', title: 'Close' },
                { id: 'high', title: 'High' },
                { id: 'low', title: 'Low' },
                { id: 'volume', title: 'Volume' },
            ],
        })

        const formatedCandles1H = formatCandles(data1YearCandles)
        const candles4H = create4HCandles(formatedCandles1H)

        await csvWriter.writeRecords(candles4H.reverse())

        // Execute strategy
        const testArray = []

        fs.createReadStream('testData.csv')
            .pipe(csvParser())
            .on('data', async (row) => {
                if (testArray.length < 40) {
                    testArray.push(row)
                } else {
                    const { position } = trader.status
                    const strategyResult = trader.runStrategyTest(testArray)

                    if (strategyResult.signal === 'Sell' && position === 'In')
                        await trader.executeSellOrder(strategyResult)
                    else if (
                        strategyResult.signal === 'Bought' &&
                        position === 'Out'
                    )
                        await trader.executeBuyOrder(strategyResult)

                    testArray.shift()
                    testArray.push()
                }
            })
            .on('end', () => {
                console.log('CSV file successfully processed')
            })

        res.send('Working')
    } catch (err) {
        res.send('Working')
        throw Error('[ Error in Test ] :' + err.toString())
    }
}

module.exports = test
