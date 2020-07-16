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
        this._status = {
            position: null,
            price: 0,
            timestamp: null,
        }
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
     * get status prop
     *
     * @return {Object} status
     *
     * @memberof Trader
     */
    get status() {
        return this._status
    }

    /**
     * set status prop
     *
     * @param {Object} value
     *
     * @memberof Trader
     */
    set status(value) {
        this._status = { ...value }
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
                    this._status
                )

            default:
                console.log('Nothing to do')
                break
        }
    }
}

module.exports = new Trader()
