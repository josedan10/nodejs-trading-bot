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

        console.log('Bot initialized')
    }
}

module.exports = TelegramBot
