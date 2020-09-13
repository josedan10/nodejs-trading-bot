const moment = require('moment-timezone')
const googleSheetsHelper = require('../helpers/google/sheets')
const strategies = require('../helpers/strategies')
const candlesHelper = require('../helpers/candlesHelper')
const { setOrder } = require('../helpers/actions/orders')
// const telegramBot = require('../telegram/telegram-bot')

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
            balance: 0,
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
            symbol: 'BTCUSD',
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
    async executeTestSellOrder(resultStatus) {
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
    async executeTestBuyOrder(resultStatus) {
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

    /**
     * Set order and update trader status
     *
     * @param {Number} amount
     * @param {Number} price
     * @param {String} symbol
     * @memberof Trader
     */
    executeBuyOrder(amount, price = null, symbol = this.status.symbol) {
        try {
            const order = {
                cid: Date.now(),
                type: 'EXCHANGE LIMIT',
                symbol: `t${symbol}`,
                amount: amount,
                price: price,
            }

            setOrder(order)
            // this.updateStatus(bfx.wallets.status)
        } catch (err) {
            throw Error(`[Trader] Error executing buy order: ${err.toString()}`)
        }
    }

    /**
     *
     *
     * @memberof Trader
     */
    async trade() {
        // I need 40 candles of 4 hour, so I must get 360 candles of 1 hour
        const candles1HrsLimit = 360
        let candles1HrsArray

        try {
            candles1HrsArray = await bfx.getCandles(
                [null, 'BTCUSD'],
                '1h',
                candles1HrsLimit
            )
        } catch (err) {
            throw Error(
                '[Trader] error getting data from bitfinex: ' + err.toString()
            )
        }

        const formatedCandles1H = formatCandles(candles1HrsArray)
        const candles4H = create4HCandles(formatedCandles1H)

        // Check strategy values
        for (let i = 0; i < candles4H.length - 40; i++) {
            const resultStatus = this.runStrategy(candles4H)

            if (resultStatus.signal === 'Sell' && this.status.position === 'In')
                this.executeSellOrder(resultStatus)
            else if (
                resultStatus.signal === 'Bought' &&
                this.status.position === 'Out'
            )
                this.executeBuyOrder(resultStatus)
            else if (resultStatus.moveStopLoss) this.moveStopLoss(resultStatus)
        }
    }
}

module.exports = new Trader()
