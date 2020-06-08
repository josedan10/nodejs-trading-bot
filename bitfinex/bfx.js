// const axios = require('axios')
const WS = require('ws')
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
        this.candleStatus = null
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
            .on('message', (msg) => msg)
    }
}

module.exports = new BitfinexConnection(
    bitfinex.bitfinexAPIKey,
    bitfinex.bitfinexSecret
)
