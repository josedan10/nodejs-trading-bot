const bfx = require('../bitfinex/bfx')
const routinesServer = require('../server/routines')
const telegramBot = require('./telegram-bot')
const fs = require('fs')
const path = require('path')
const { takeScreenshot } = require('../helpers/screenshot')

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
        const { text, chat } = message

        try {
            switch (chat.type) {
                case PRIVATE_CHAT:
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
        let command
        let args
        let messageSliced

        if (message.text) {
            if (message.chat.type === SUPERGROUP_CHAT) {
                command = message.text.split('@')[0].slice(1)
                args = message.text.split(' ').slice(1)
            } else {
                messageSliced = message.text.split(' ')
                command = messageSliced[0].slice(1)
                args = messageSliced.slice(1)
            }
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

            case 'strategy':
                await routinesServer.setStrategy(args, message.chat.id)

                return [
                    message.chat.id,
                    'Setted up the ' + args[0] + ' strategy',
                ]

            case 'routine':
                routinesServer.setRoutine(
                    'candlesStatus',
                    args,
                    message.chat.id
                )
                return [message.chat.id, 'Setting routine update']

            case 'screenshot':
                const fileName = await takeScreenshot()
                if (fileName !== undefined)
                    await telegramBot.sendPhoto(message.chat.id, fileName)
                else
                    return [
                        message.chat.id,
                        `[ERROR] the file ${fileName} is invalid`,
                    ]

                return [message.chat.id, 'Screenshot!']

            case 'help':
                return [message.chat.id, readHelp(), 'MarkdownV2']

            default:
                return [message.chat.id, 'Nothing to do, sorry!']
        }
    }
}

module.exports = new CommandHandler()
