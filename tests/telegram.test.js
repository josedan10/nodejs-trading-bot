const config = require('../config')
const { telegramAPIKey, telegramChatID } = config.telegram
const TelegramBot = require('../telegram/telegram-bot')

const telegramBot = new TelegramBot(telegramAPIKey, telegramChatID)

// Test telegram bot connection
describe('Tests of telegram Bot', () => {
    test('Test getMe method of telegram bot', () => {
        return telegramBot.getMe().then((data) => {
            expect(data.status).toBe(200)
        })
    }, 8000)
})
