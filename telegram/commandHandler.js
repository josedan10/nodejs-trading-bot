/**
 * Bot Commands handler
 *
 * @class CommandHandler
 */
class CommandHandler {
    /**
     *  Resolves the commands
     *
     * @param {Object} message
     * @return {Array} [chatId, responseMessage]
     * @memberof CommandHandler
     */
    async resolveCommand(message) {
        const command = message.text.split('@')[0].slice(1) // Remove the '/' and the bot name
        return [message.chat.id, command]
    }
}

module.exports = CommandHandler
