const config = require('../config')
const bodyParser = require('body-parser')
const express = require('express')

const { server } = require('../config')
const app = express()
const CommandHandler = require('../telegram/commandHandler')
const bot = require('../telegram/telegram-bot')

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
    console.log('Started the app')
}

app.get('/', async (req, res) => {
    try {
        await main()
        res.send('Hello world!')
    } catch (err) {
        console.error(err)
    }
})

// Endpoints
app.post('/', CommandHandler.handler.bind(CommandHandler))

app.listen(server.port, function () {
    console.log(`The server is running on port ${server.port}`)
})
