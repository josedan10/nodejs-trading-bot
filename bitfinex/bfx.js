// const axios = require('axios')
const WS = require('ws')
const { bitfinex } = require('../config')

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
                .on('message', (msg) => {
                    expect(JSON.parse(msg).id).toEqual(0)
                    console.log(msg)
                })
                .on('close', () => done())
        } catch (err) {
            console.error(err)
            return 'Connection failed'
        }
    }
}

module.exports = BitfinexConnection
