const config = require('./config')

// Telegram Bot
const TelegramBot = require('./telegram/bot')

/**
 * Starts the main process of the app
 *
 */
function main() {
    // Start the app
    const bot = new TelegramBot(
        config.telegram.telegramAPIKey,
        config.telegram.telegramChatID
    )
    console.log(bot)

    console.log('Testing lint here')
}

main()
