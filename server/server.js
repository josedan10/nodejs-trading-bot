const config = require('../config')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const TelegramBot = require('../telegram/telegram-bot')

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
    await bot.setWebhook(config.telegram.webhookURL)
}

const bot = new TelegramBot()

app.get('/', (req, res) => res.send('Hello world!'))

// Endpoints
app.post('/', bot.handler.bind(bot))

app.listen(80, async function () {
    main()
    console.log('Example app listening on port 80!')
})
