// const axios = require('axios')
const WS = require('ws')
const moment = require('moment')
const { bitfinex, telegram } = require('../config')
const telegramBot = require('../telegram/telegram-bot')

/**
 * Exchange handler object
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
    }

    /**
     * Starts the websocket connection
     *
     * @memberof BitfinexConnection
     * @return {Websocket}
     */
    startWS() {
        try {
            this.ws = new WS(bitfinex.bitfinexPublicURL)
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
            this.ws.close()
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
        this.ws
            .on('open', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    'Connected to websocket server'
                )
            })
            .on('close', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    'Disconnected from websocket server'
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
            moment(this.candleStatus.candle[0] / 1000).isBefore(
                msg[1][0] / 1000
            )

        return (
            isTheCandleChannel &&
            isAnUpdate &&
            isNotTheSnapShot &&
            (thereAreNotPreviousStatus || isTheLatestUpdate)
        )
    }
}

module.exports = new BitfinexConnection(
    bitfinex.bitfinexAPIKey,
    bitfinex.bitfinexSecret
)
