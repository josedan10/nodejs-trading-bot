const moment = require('moment-timezone')
// const CsvReadableStream = require('csv-reader')
// const fs = require('fs')
const CreateCsvWriter = require('csv-writer').createObjectCsvWriter
// const csvParser = require('csv-parser')
const strategies = require('../helpers/strategies')
const candlesHelper = require('../helpers/candlesHelper')

/**
 * Trader object to execute strategies
 *
 * @class Trader
 */
class Trader {
    /**
     * Creates an instance of Trader.
     * @memberof Trader
     */
    constructor() {
        this._symbol = null

        this.status = {
            position: 'Out', // values: ['In', 'Out']
            price: 0, // Symbol price
            timestamp: null, // Order timestamp
            amount: 0, // Base currency amount
            profitLoss: 0, // Total profit/loss on base currency
            percentage: 0, // Profit/loss percentage
            initialAmount: 0, // Initial amount on base currency
            date: false, // Date order
            signal: 'Sell', // Type of signal ['Sell', 'Bought']
            symbolAmount: 0, // Amount on pair currency
        }

        this.fieldNames = [
            'Signal',
            'Date',
            'Price',
            'Amount',
            'Profit/Loss',
            'Percentage',
        ]

        this._strategy = 'adeline'
    }

    /**
     * get symbol prop
     *
     * @memberof Trader
     * @return {String} symbol
     */
    get symbol() {
        return this._symbol
    }

    /**
     * set symbol prop
     * @param {String} value
     *
     * @memberof Trader
     */
    set symbol(value) {
        this._symbol = value
    }

    /**
     * @return {String} strategy
     *
     * @memberof Trader
     */
    get strategy() {
        return this._strategy
    }

    /**
     * @param {String} value strategy
     *
     * @memberof Trader
     */
    set strategy(value) {
        this._strategy = value
    }

    /**
     *  Execute the trader's strategy
     *
     * @param {Array} data candles array without format
     * @memberof Trader
     *
     * @return {Object} status
     */
    runStrategy(data) {
        // All strategies work with formated candles
        const formatedCandles = candlesHelper.formatCandles(data)

        switch (this._strategy) {
            case 'adeline':
                return strategies.adeline(
                    formatedCandles,
                    this._symbol,
                    this.status
                )

            default:
                console.log('Nothing to do')
                break
        }
    }

    /**
     * Write the order in results file
     *
     * @param {*} order
     * @memberof Trader
     */
    writeOrder(order) {
        try {
            const csvWriter = new CreateCsvWriter({
                path: './testData.csv',
                header: [
                    { id: 'date', title: 'Date' },
                    { id: 'signal', title: 'Signal ' },
                    { id: 'price', title: 'Price' },
                    { id: 'amount', title: 'Amount' },
                    { id: 'profit_loss', title: 'ProfitLoss' },
                    { id: 'percentage', title: 'Percentage' },
                ],
            })

            csvWriter.writeRecords(order)
        } catch (err) {
            console.log(err)
        }
    }

    /**
     *  Execute the trader's strategy
     *
     * @param {Array} data candles array without format
     * @memberof Trader
     *
     * @return {Object} status
     */
    runStrategyTest(data) {
        // All strategies work with formated candles
        data = data.map((candle) => [
            candle.Timestamp,
            candle.Open,
            candle.Close,
            candle.High,
            candle.Low,
            candle.Volume,
        ])

        const formatedCandles = candlesHelper.formatCandles(data)

        switch (this._strategy) {
            case 'adeline':
                return strategies.adeline(
                    formatedCandles,
                    this._symbol,
                    this.status
                )

            default:
                console.log('Nothing to do')
                break
        }
    }

    /**
     *
     *
     * @param {*} resultStatus
     * @memberof Trader
     */
    async executeSellOrder(resultStatus) {
        const date = moment(resultStatus.timestamp)
        const _this = this

        // Read the last previous result
        const lastRow = listData[listData.length - 1]

        try {
            const price = lastRow.price

            _this.status.amount = _this.status.symbolAmount * price
            _this.status.symbolAmount = 0
            _this.status.position = 'Out'

            const profitLoss =
                _this.status.amount - parseFloat(lastRow['Amount'])
            const percentage =
                ((price - parseFloat(lastRow['Price'])) * 100) /
                parseFloat(lastRow['Price'])

            _this.status.profitLoss += profitLoss
            _this.status.percentage += percentage

            const order = {
                date: date
                    .tz('America/Caracas')
                    .format('dddd, MMMM Do YYYY, HH:mm'),
                signal: resultStatus.signal,
                profit_loss: profitLoss,
                percentage,
                amount: _this.status.amount,
                price,
            }

            _this.writeOrder(order)
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Buy and register order
     *
     * @param {*} resultStatus
     * @memberof Trader
     */
    async executeBuyOrder(resultStatus) {
        try {
            const date = moment(resultStatus.timestamp)

            // Buy don't read previous results

            const price = parseFloat(resultStatus.price)

            const profitLoss = 0
            const percentage = 0

            const order = {
                date: date
                    .tz('America/Caracas')
                    .format('dddd, MMMM Do YYYY, HH:mm'),
                signal: resultStatus.signal,
                profit_loss: profitLoss,
                percentage,
                amount: this.status.amount,
                price,
            }

            await this.writeOrder(order)

            this.status.symbolAmount = this.status.amount / price
            this.status.amount = 0
            this.status.position = 'In'
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = new Trader()
