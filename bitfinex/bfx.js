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
    }

    /**
     * Starts the websocket connection
     *
     * @memberof BitfinexConnection
     */
    async startWS() {
        try {
            this.ws = new WS(bitfinex.bitfinexPublicURL)
            this.setup()
        } catch (err) {
            console.error(err)
            return 'Connection failed'
        }
    }

    /**
     * Set the event listeners
     *
     * @memberof BitfinexConnection
     */
    setup() {
        this.ws.on('open', function () {
            telegramBot.sendMessage(telegram.telegramChatID, 'Connected')
        })
    }
}

module.exports = new BitfinexConnection(
    bitfinex.bitfinexAPIKey,
    bitfinex.bitfinexSecret
)
