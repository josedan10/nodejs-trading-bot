const config = require('../config')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')

const { server, client } = require('../config')
const CommandHandler = require('../telegram/commandHandler')
const bot = require('../telegram/telegram-bot')
const Test = require('../trader/testScript')
const googleAuthenticator = require('../helpers/google/auth')

const app = express()

// Routers
const chartRouter = require('./routes/chart')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use(cors())

/**
 * Starts the main process of the app
 *  @param {Object} req
 *  @param {Object} res
 */
async function main(req, res) {
    // Start the app
    try {
        await bot.setWebhook(config.telegram.webhookURL)
        await bot.setCommands()
        googleAuthenticator.authorize()

        console.log('Started the app')
    } catch (err) {
        console.error(err)
    }
}

// Api routes
app.use('/api', chartRouter)

// Main view
app.get('/', async (req, res) => {
    try {
        res.send(`
            <h1>NoPythonBot server: </h1>
            <p>The client app is running on server ${client.url}</p>
        `)
    } catch (err) {
        console.error(err)
    }
})

// Endpoints
app.post('/', CommandHandler.handler.bind(CommandHandler))
app.get('/test', Test)

app.listen(server.port, function () {
    console.log(`The server is running on port ${server.port}`)
})

main()
