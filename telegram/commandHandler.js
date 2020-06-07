const bfx = require('../bitfinex/bfx')
const telegramBot = require('./telegram-bot')

/**
 * Bot Commands handler
 *
 * @class CommandHandler
 */
class CommandHandler {
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
        console.log(command)

        // Dispatcher
        switch (command) {
            case 'start':
                await bfx.startWS(telegramBot.sendMessage)
                return [message.chat.id, 'Connecting to server']

            default:
                return [message.chat.id, 'Nothing to do, sorry!']
        }
    }
}

module.exports = new CommandHandler()
