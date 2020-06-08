const { telegram } = require('../config')
const bfx = require('../bitfinex/bfx')
const telegramBot = require('../telegram/telegram-bot')

describe('Tests of bitfinex API connection', () => {
    test('Connect with websocket server', async () => {
        bfx.startWS()
        bfx.ws.on('open', () => {
            telegramBot.sendMessage(
                telegram.telegramChatID,
                'Connected to websocket server'
            )
            expect(true).toBe(true)
        })
    })
})
