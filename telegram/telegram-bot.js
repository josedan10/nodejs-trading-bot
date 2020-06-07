const axios = require('axios')

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
     * @param {string} chatID - Chat id group.
     * @memberof TelegramBot
     */
    constructor(apiKey, chatID) {
        this.apiKey = apiKey
        this.chatID = chatID
        this.webhookUrl = null
        this.url = `https://api.telegram.org/bot${this.apiKey}/`

        console.log('Bot initialized')
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
     * Send 'Hello' message
     *
     * @param {String} text
     * @return {Object} Telegram Message
     * @memberof TelegramBot
     */
    async sendMessage(text) {
        try {
            return axios.get(this.url + 'sendMessage', {
                params: {
                    chat_id: this.chatID,
                    text,
                },
            })
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = TelegramBot
