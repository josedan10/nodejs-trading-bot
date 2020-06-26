const axios = require('axios')
const { telegram } = require('../config')

/**
 * Connect with telegram API endpoints and interacts
 * with the user commands
 *
 * @class TelegramBot
 */
class TelegramBot {
    /**
     *Creates an instance of TelegramBot.
     * @param {string} apiKey - Bot apiKey.
     * @memberof TelegramBot
     */
    constructor(apiKey = telegram.telegramAPIKey) {
        this.apiKey = apiKey
        this.webhookUrl = null
        this.url = `https://api.telegram.org/bot${this.apiKey}/`
        this.routines = {}
    }

    /**
     *  Executes the getMe function of telegram bots
     *
     * @return {Object} getMe status
     * @memberof TelegramBot
     */
    async getMe() {
        try {
            return axios.get(this.url + 'getMe')
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Set the webhook on deploy server
     *
     * @param {URL} webhookUrl
     * @return {Object} response
     * @memberof TelegramBot
     */
    async setWebhook(webhookUrl) {
        this.webhookUrl = webhookUrl

        try {
            return axios.get(`${this.url}setWebhook?url=${webhookUrl}`)
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Send a message to selected channel_id
     *
     * @param {Int} chatID
     * @param {String} text
     * @param {String} parse_mode
     * @return {Object} Telegram Message
     * @memberof TelegramBot
     */
    async sendMessage(chatID, text, parse_mode = '') {
        try {
            return axios
                .get(this.url + 'sendMessage', {
                    params: {
                        chat_id: chatID,
                        text,
                        parse_mode,
                    },
                })
                .then((res) => {
                    console.log('Ok')
                    return res
                })
                .catch((err) => {
                    throw Error(
                        `[TelegramBot] Error sending a message:${err.toString()}`
                    )
                })
        } catch (err) {
            throw Error(
                `[TelegramBot] Error sending a message:${err.toString()}`
            )
        }
    }

    /**
     * Send a photo using the chatID
     *
     * @param {Integer} chatID
     * @param {String} fileName
     * @memberof TelegramBot
     */
    async sendPhoto(chatID, fileName) {
        try {
            return axios
                .get(this.url + 'sendPhoto', {
                    params: {
                        chat_id: chatID,
                        photo: `${telegram.webhookURL}/api/screenshot?fileName=${fileName}`,
                    },
                })
                .then((res) => {
                    return res
                })
                .catch((err) => {
                    console.log(err)
                    throw Error(
                        `[TelegramBot] Error sending a photo:${err.toString()}`
                    )
                })
        } catch (err) {
            throw Error(`[TelegramBot] Error sending a photo:${err.toString()}`)
        }
    }
}

module.exports = new TelegramBot()
