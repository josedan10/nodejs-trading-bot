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
        return [
            message.chat.id,
            `Hello ${message.from.first_name}! Actually I'm under construction.`,
        ]
    }
}

module.exports = CommandHandler
