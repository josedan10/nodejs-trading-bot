const bfx = require('../bitfinex/bfx')
const routinesServer = require('../server/routines')
const telegramBot = require('./telegram-bot')

// Chat types
const PRIVATE_CHAT = 'private'
const SUPERGROUP_CHAT = 'supergroup'

// Entities
const COMMAND_ENTITY = 'bot_command'

/**
 * Bot Commands handler
 *
 * @class CommandHandler
 */
class CommandHandler {
    /**
     * Bot Requests Handler
     *
     * @param {Object} req
     * @param {Object} res
     * @memberof CommandHandler
     */
    async handler(req, res) {
        const { message } = req.body
        const { text, from, chat } = message

        try {
            switch (chat.type) {
                case PRIVATE_CHAT:
                    await telegramBot.sendMessage(from.id, text)
                    break

                case SUPERGROUP_CHAT:
                    if (message.entities[0].type === COMMAND_ENTITY) {
                        const [
                            chatID,
                            responseMessage,
                        ] = await this.resolveCommand(message)
                        telegramBot.sendMessage(chatID, responseMessage)
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

    /**
     *  Extract the command
     *
     * @param {Object} message
     * @return {String} command
     * @memberof CommandHandler
     */
    async getCommand(message) {
        return message.text.split('@')[0].slice(1) // Remove the '/' and the bot name
    }

    /**
     * Commands dispatcher
     *
     * @param {Object} message
     * @return {Array} [chatID, response]
     * @memberof CommandHandler
     */
    async resolveCommand(message) {
        const command = await this.getCommand(message)

        // Dispatcher
        switch (command) {
            case 'start':
                bfx.startWS()
                return [message.chat.id, 'Connecting to server']

            case 'stop':
                bfx.stopWS()
                return [message.chat.id, 'Stopping server']

            case 'trade':
                bfx.subscribeToCandles()
                return [
                    message.chat.id,
                    'Starting to get trading info... Wait a moment...',
                ]

            case 'routine':
                // TODO: getargs of message
                routinesServer.setRoutine('candlesStatus', '10min')
                return [message.chat.id, 'Setting routine update']

            default:
                return [message.chat.id, 'Nothing to do, sorry!']
        }
    }
}

module.exports = new CommandHandler()
