const config = require('./config')

// Telegram Bot
const TelegramBot = require('./telegram/telegram-bot')

const express = require('express')
const app = express()

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
    bot.setWebhook(config.telegram.webhookURL)
}

app.get('/', function (req, res) {
    main()
    res.send('Hello World!')
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
