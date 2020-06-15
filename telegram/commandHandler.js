const bfx = require('../bitfinex/bfx')
const routinesServer = require('../server/routines')
const telegramBot = require('./telegram-bot')
const fs = require('fs')
const path = require('path')

// Chat types
const PRIVATE_CHAT = 'private'
const SUPERGROUP_CHAT = 'supergroup'

// Entities
const COMMAND_ENTITY = 'bot_command'

// Read the help.md file
const readHelp = () =>
    fs.readFileSync(path.resolve(path.join('telegram/', 'help.md')), {
        encoding: 'utf-8',
    })

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
        let { message } = req.body
        if (!message) message = req.body.edited_message
        const { text, from, chat } = message

        try {
            switch (chat.type) {
                case PRIVATE_CHAT:
                    await telegramBot.sendMessage(from.id, text)
                    break

                case SUPERGROUP_CHAT:
                    if (
                        message.entities &&
                        message.entities[0].type === COMMAND_ENTITY
                    ) {
                        const [
                            chatID,
                            responseMessage,
                            parseMode = '',
                        ] = await this.resolveCommand(message)
                        telegramBot.sendMessage(
                            chatID,
                            responseMessage,
                            parseMode
                        )
                    }
                    break

                default:
                    console.log('Nothing to do')
            }
            res.send(text || 'Chat event')
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
        // Remove the '/' and the bot name
        if (message.text) {
            const command = message.text.split('@')[0].slice(1)
            const args = message.text.split(' ').slice(1)
            return { command, args }
        } else return null
    }

    /**
     * Commands dispatcher
     *
     * @param {Object} message
     * @return {Array} [chatID, response]
     * @memberof CommandHandler
     */
    async resolveCommand(message) {
        const { command, args } = await this.getCommand(message)

        // Dispatcher
        switch (command) {
            case 'start':
                await bfx.startWS()
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
                routinesServer.setRoutine('candlesStatus', args)
                return [message.chat.id, 'Setting routine update']

            case 'help':
                return [message.chat.id, readHelp(), 'MarkdownV2']

            default:
                return [message.chat.id, 'Nothing to do, sorry!']
        }
    }
}

module.exports = new CommandHandler()
