const config = require('./config')

// Telegram Bot
const TelegramBot = require('./telegram/telegram-bot')

const express = require('express')
const app = express()

/**
 * Starts the main process of the app
 *
 */
async function main() {
    // Start the app
    const bot = new TelegramBot(
        config.telegram.telegramAPIKey,
        config.telegram.telegramChatID
    )
    await bot.setWebhook(config.telegram.webhookURL)
}

app.get('/', async function (req, res) {
    await main()
    res.send('Hello World!')
})

app.listen(3000, async function () {
    console.log('Example app listening on port 3000!')
})
