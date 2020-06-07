const config = require('../config')
const bodyParser = require('body-parser')

// Telegram Bot
const TelegramBot = require('../telegram/telegram-bot')

const express = require('express')
const app = express()

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

/**
 * Starts the main process of the app
 *  @param {Object} req
 *  @param {Object} res
 */
async function main(req, res) {
    // Start the app
    const bot = new TelegramBot(
        config.telegram.telegramAPIKey,
        config.telegram.telegramChatID
    )
    await bot.setWebhook(config.telegram.webhookURL)

    res.send('Hello World!')
}

app.get('/', main)

// Endpoints
app.post('/', (req, res) => {
    console.log(req.body)
    res.send(req.body)
})

app.listen(80, async function () {
    console.log('Example app listening on port 80!')
})
