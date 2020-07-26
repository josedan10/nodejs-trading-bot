// const axios = require('axios')
const WS = require('ws-reconnect')
const moment = require('moment')
const { bitfinex, telegram } = require('../config')
const telegramBot = require('../telegram/telegram-bot')
const axios = require('axios')

/**
 * Exchange handler object
 *
 * @see https://docs.bitfinex.com/docs/rest-auth
 *
 * @class BitfinexConnection
 */
class BitfinexConnection {
    /**
     * Creates an instance of BitfinexConnection.
     * @param {String} APIKey
     * @param {String} APISecret
     * @memberof BitfinexConnection
     */
    constructor(APIKey, APISecret) {
        this.APIKey = APIKey
        this.APISecret = APISecret
        this.ws = null
        this.candleStatus = {
            channelId: null,
            /**
             *  MTS	int	millisecond time stamp
             *  OPEN	float	First execution during the time frame
             *  CLOSE	float	Last execution during the time frame
             *  HIGH	float	Highest execution during the time frame
             *  LOW	float	Lowest execution during the timeframe
             *  VOLUME	float	Quantity of symbol traded within the timeframe
             */
            candle: null,
        }
        this.candleTimeframe = '1h' // By default 1 hour
        this.market = 'BTCUSD'
        this.wallets = null
        this.restPublicURL = bitfinex.bitfinexRESTPublicURL
    }

    /**
     * Starts the websocket connection
     *
     * @memberof BitfinexConnection
     * @return {Websocket}
     */
    startWS() {
        try {
            this.ws = new WS(bitfinex.bitfinexPublicURL, {
                retryCount: 3, // default is 2
                reconnectInterval: 3, // default is 5
            })
            this.ws.start()
            this.setup()
            return this.ws
        } catch (err) {
            console.error(err)
            return 'Connection failed'
        }
    }

    /**
     *  Disconnects from websocket server
     *
     * @return {Boolean} connection closed succesfully
     * @memberof BitfinexConnection
     */
    stopWS() {
        try {
            this.ws.destroy()
            return true
        } catch (err) {
            console.error(err)
            return err
        }
    }

    /**
     * Set the event listeners
     *
     * @memberof BitfinexConnection
     */
    setup() {
        const _this = this

        _this.ws
            .on('connect', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    'Connected to websocket server'
                )
            })
            .on('destroyed', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    'Disconnected from websocket server'
                )
            })
            .on('reconnect', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    'Trying to reconnect to websocket server...'
                )
            })
            .on('message', (msg) => {
                console.log('Nuevo mensaje: ', msg)
                msg = JSON.parse(msg)

                if (!Array.isArray(msg)) {
                    // It's an info or suscribe msg
                    this.logEvent(msg)
                } else {
                    // It's a channel update
                    if (this.isCandleUpdate(msg)) {
                        this.candleStatus.candle = msg[1]
                    }
                }
            })
    }

    /**
     * Handler of events info Objects
     *
     * @param {*} msg
     * @memberof BitfinexConnection
     */
    logEvent(msg) {
        switch (msg.event) {
            case 'subscribed':
                if (msg.channel === 'candles')
                    this.candleStatus.channelId = msg.chanId
                break

            default:
                break
        }
    }

    /**
     * Subscribe to get candles updates
     *
     * @memberof BitfinexConnection
     */
    subscribeToCandles() {
        const msg = JSON.stringify({
            event: 'subscribe',
            channel: 'candles',
            key: `trade:${this.candleTimeframe}:t${this.market}`, // 'trade:TIMEFRAME:SYMBOL'
        })

        this.ws && this.ws.send(msg)
    }

    // UPDATES VALIDATORS //////////////////////////////
    /**
     * Check if the msg is a real candle udpdate
     * check the type of msg and if the timestamps
     * is later than the actual candle
     *
     * @param {Object} msg
     * @return {Bolean}
     * @memberof BitfinexConnection
     */
    isCandleUpdate(msg) {
        const isTheCandleChannel = msg[0] === this.candleStatus.channelId
        const isAnUpdate = Array.isArray(msg[1])
        const isNotTheSnapShot = msg[1].length === 6
        const thereAreNotPreviousStatus =
            this.candleStatus.candle === null ||
            this.candleStatus.candle === undefined
        const isTheLatestUpdate =
            this.candleStatus.candle &&
            moment(this.candleStatus.candle[0] / 1000).isSameOrBefore(
                msg[1][0] / 1000
            )

        return (
            isTheCandleChannel &&
            isAnUpdate &&
            isNotTheSnapShot &&
            (thereAreNotPreviousStatus || isTheLatestUpdate)
        )
    }

    // REST Methods
    /**
     *  Get candles using public endpoint of bitfinex REST API
     *
     * @param {String} args [strategy, symbol]
     * @param {String} tf
     * @param {Integer} limit
     * @return {Array}
     * @memberof BitfinexConnection
     */
    async getCandles(args, tf, limit) {
        const symbol = args[1].toUpperCase()

        try {
            const { data } = await axios.get(
                `${this.restPublicURL}/candles/trade:${tf}:t${symbol}/hist`,
                {
                    params: {
                        limit,
                    },
                }
            )

            return data
        } catch (error) {
            throw Error('[Bitfinex Connection]: ' + error.toString())
        }
    }

    /**
     *
     *
     * @param {String} symbol
     * @param {String} tf
     * @param {Integer} limit
     * @param {String} sheetName
     * @memberof BitfinexConnection
     */
    setTestData(symbol, tf, limit = 1000, sheetName) {
        try {
            const candles1Hr = axios.get(
                `${this.restPublicURL}/candles/trade:${tf}:t${symbol}/hist`,
                {
                    params: {
                        limit,
                    },
                }
            )
            console.log(candles1Hr)
        } catch (error) {
            throw Error('[Trader]: ' + error.toString())
        }
    }
}

module.exports = new BitfinexConnection(
    bitfinex.bitfinexAPIKey,
    bitfinex.bitfinexSecret
)
