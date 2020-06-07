const config = require('../config')
const { telegramAPIKey, telegramChatID, webhookURL } = config.telegram
const TelegramBot = require('../telegram/telegram-bot')

const telegramBot = new TelegramBot(telegramAPIKey, telegramChatID)

// Test telegram bot connection
describe('Tests of telegram Bot', () => {
    test('Test getMe method of telegram bot', async () => {
        return telegramBot.getMe().then((data) => {
            expect(data.status).toBe(200)
        })
    }, 8000)

    test('should set webhook', async () => {
        return telegramBot.setWebhook(webhookURL).then(({ data }) => {
            expect(data.ok).toBe(true)
        })
    })

    test('Should send a "Hello" message to the chat', async () => {
        return telegramBot
            .sendMessage('Hello from jest test')
            .then(({ data }) => {
                expect(data.ok).toBe(true)
            })
    })
})
