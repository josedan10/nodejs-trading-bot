const axios = require('axios')
const { telegram } = require('../config')
const CommandHandler = require('./commandHandler')

// Chat types
const PRIVATE_CHAT = 'private'
const SUPERGROUP_CHAT = 'supergroup'

// Entities
const COMMAND_ENTITY = 'bot_command'

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
     * @param {Int} chatID
     * @param {String} text
     * @return {Object} Telegram Message
     * @memberof TelegramBot
     */
    async sendMessage(chatID, text) {
        try {
            return axios.get(this.url + 'sendMessage', {
                params: {
                    chat_id: chatID,
                    text,
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Bot Requests Handler
     *
     * @param {Object} req
     * @param {Object} res
     * @memberof TelegramBot
     */
    async handler(req, res) {
        const { message } = req.body
        const { text, from, chat } = message

        try {
            switch (chat.type) {
                case PRIVATE_CHAT:
                    await this.sendMessage(from.id, text)
                    break

                case SUPERGROUP_CHAT:
                    if (message.entities[0].type === COMMAND_ENTITY) {
                        const [
                            chatID,
                            responseMessage,
                        ] = await CommandHandler.resolveCommand(message)
                        this.sendMessage(chatID, responseMessage)
                    }
                    break

                default:
                    console.log('Nothing to do')
            }
            res.send(text)
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = new TelegramBot()
