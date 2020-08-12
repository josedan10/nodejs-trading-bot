const moment = require('moment-timezone')
const googleSheetsHelper = require('../helpers/google/sheets')
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
            date: null, // Date order
            signal: 'Sell', // Type of signal ['Sell', 'Bought']
            symbolAmount: 0, // Amount on pair currency
            stopLossPercentage: 0.02, // Stop loss percentage intially relative to bought price
            stopLossPrice: 0,
            moveStopLossPercentage: 0.04,
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
     * @param {Array} data candles array formated candles
     * @memberof Trader
     *
     * @return {Object} status
     */
    runStrategy(data) {
        // All strategies work with formated candles

        switch (this._strategy) {
            case 'adeline':
                return strategies.adeline(data, this._symbol, this.status)

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
    async writeOrder(order) {
        return new Promise((resolve, reject) => {
            try {
                const sheetResultsParams = {
                    sheetName: 'TestResults',
                    range: 'A2',
                    majorDimension: 'ROWS',
                }

                setTimeout(
                    () =>
                        resolve(
                            googleSheetsHelper.appendToSheet(
                                [order],
                                sheetResultsParams
                            )
                        ),
                    1500
                )
            } catch (err) {
                console.log(err)
            }
        })
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
        // lastRo = [date, signal, price, amount, profitLoss, percentage]
        const lastRow = await googleSheetsHelper.getLastRow('TestResults')

        try {
            const price = resultStatus.price

            _this.status.amount = _this.status.symbolAmount * price
            _this.status.symbolAmount = 0
            _this.status.position = 'Out'
            _this.status.stopLossPrice = null

            const profitLoss = _this.status.amount - parseFloat(lastRow[3])
            const percentage =
                ((price - parseFloat(lastRow[2])) * 100) /
                parseFloat(lastRow[2])

            _this.status.profitLoss += profitLoss
            _this.status.percentage += percentage

            const order = [
                date.tz('America/Caracas').format('dddd, MMMM Do YYYY, HH:mm'),
                resultStatus.signal,
                price,
                _this.status.amount,
                profitLoss,
                percentage,
            ]

            await _this.writeOrder(order)
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Buy and register order
     *
     * @param {Object} resultStatus
     * @memberof Trader
     */
    async executeBuyOrder(resultStatus) {
        try {
            const date = moment(resultStatus.timestamp)

            // Buy don't read previous results

            const price = parseFloat(resultStatus.price)

            const profitLoss = 0
            const percentage = 0

            const order = [
                date.tz('America/Caracas').format('dddd, MMMM Do YYYY, HH:mm'),
                resultStatus.signal,
                price,
                this.status.amount,
                profitLoss,
                percentage,
            ]

            this.status.symbolAmount = this.status.amount / price
            this.status.amount = 0
            this.status.position = 'In'
            this.status.stopLossPrice =
                price * (1 - this.status.stopLossPercentage)

            await this.writeOrder(order)
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Move the stopLoss price
     *
     * @param {Object} status
     */
    moveStopLoss(status) {
        this.stopLossPrice = status.price * (1 - this.status.stopLossPercentage)
    }
}

module.exports = new Trader()
