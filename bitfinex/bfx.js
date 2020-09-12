// const axios = require('axios')
const WS = require('ws-reconnect')
const moment = require('moment')
const axios = require('axios')
const crypto = require('crypto-js')

const { bitfinex, telegram } = require('../config')
const telegramBot = require('../telegram/telegram-bot')

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
        this.authChannelId = 0 // Auth id channel in bfx is number 0
        this.wallets = {
            walletUpdateType: 'wu',
            status: [],
        }
        this.balance = 0
        this.candleTimeframe = '1h' // By default 1 hour
        this.market = 'BTCUSD'
        this.restPublicURL = bitfinex.bitfinexRESTPublicURL
        this.restAuthURL = bitfinex.bitfinexRESTAuthURL
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
                const authPayload = _this.getAuthWSPayload()
                _this.ws.send(JSON.stringify(authPayload))

                _this.subscribeToCandles()

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

                    // Wallets update
                    if (this.isWalletUpdate(msg)) {
                        this.wallets.status = msg[2]
                    }

                    // Balance update
                    if (this.isBalanceUpdate(msg)) {
                        this.balance = msg[2][0]
                    }
                }
            })
    }

    /**
     *  Set the Auth payload for ws connection
     *
     * @return {AuthWSPayload}
     * @memberof BitfinexConnection
     */
    getAuthWSPayload() {
        const authNonce = Date.now() * 1000 // Generate an ever increasing, single use value. (a timestamp satisfies this criteria)
        const authPayload = 'AUTH' + authNonce // Compile the authentication payload, this is simply the string 'AUTH' prepended to the nonce value
        const authSig = crypto
            // eslint-disable-next-line new-cap
            .HmacSHA384(authPayload, this.APISecret)
            .toString(crypto.enc.Hex) // The authentication payload is hashed using the private key, the resulting hash is output as a hexadecimal string

        const { APIKey: apiKey } = this

        return {
            apiKey, // API key
            authSig, // Authentication Sig
            authNonce,
            authPayload,
            event: 'auth', // The connection event, will always equal 'auth'
        }
    }

    /**
     * Set the headers for auth rest endpoints
     * @param {String} apiPath
     * @param {Object} body payload
     *
     * @return {Object} options
     * @memberof BitfinexConnection
     */
    getAuthRestHeaders(apiPath, body) {
        const nonce = Date.now() * 1000 // Standard nonce generator. Timestamp * 1000

        const signature = `/api/v2${apiPath}${nonce}${JSON.stringify(body)}`
        // Consists of the complete url, nonce, and request body

        // eslint-disable-next-line new-cap
        const sig = crypto.HmacSHA384(signature, this.APISecret).toString()
        // The authentication signature is hashed using the private key

        return {
            nonce,
            signature: sig,
        }
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

    /**
     * Check if the msg is an wallet update
     *
     * @param {Object} msg
     * @return {Boolean}
     * @memberof BitfinexConnection
     */
    isWalletUpdate(msg) {
        const isAuthChannel = msg[0] === this.authChannelId
        const isWalletUpdateType = msg[1] === this.wallets.walletUpdateType
        return isAuthChannel && isWalletUpdateType
    }

    /**
     * Check if an balance update event
     *
     * @param {Object} msg
     * @return {Boolean}
     * @memberof BitfinexConnection
     */
    isBalanceUpdate(msg) {
        const isAuthChannel = msg[0] === this.authChannelId
        const isBalanceUpdateType = msg[1] === 'bu'
        return isAuthChannel && isBalanceUpdateType
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

    /**
     * Get Wallets status
     *
     * @memberof BitfinexConnection
     */
    async getWalletsUpdate() {
        const path = '/auth/r/wallets'
        const { nonce, signature } = this.getAuthRestHeaders(path)

        try {
            const res = await axios.post(
                `${this.restAuthURL + path}`,
                {},
                {
                    headers: {
                        'bfx-nonce': nonce,
                        'bfx-apikey': this.APIKey,
                        'bfx-signature': signature,
                    },
                }
            )

            console.log(res)

            return res
        } catch (err) {
            console.log(err)
            throw Error(
                `[Bitfinex] Error getting wallets update: ${err.toString()}`
            )
        }
    }
}

module.exports = new BitfinexConnection(
    bitfinex.bitfinexAPIKey,
    bitfinex.bitfinexSecret
)
