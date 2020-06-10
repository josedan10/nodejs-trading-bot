const config = require('../config')
const { telegramChatID, webhookURL } = config.telegram
const telegramBot = require('../telegram/telegram-bot')
const CommandHandler = require('../telegram/commandHandler')

// Test telegram bot connection
describe('Tests of telegram Bot', () => {
    test('Test getMe method of telegram bot', async () => {
        return telegramBot.getMe().then((data) => {
            expect(data.status).toBe(200)
        })
    })

    test('should set webhook', async () => {
        return telegramBot.setWebhook(webhookURL).then(({ data }) => {
            expect(data.ok).toBe(true)
        })
    })

    test('Should send a "Hello" message to the chat', async () => {
        return telegramBot
            .sendMessage(
                telegramChatID,
                '**Hello from jest test**',
                'markdownv2'
            )
            .then(({ data }) => {
                expect(data.ok).toBe(true)
            })
    })
})

describe('Test telegram commands responses', () => {
    test('Testing default response', async () => {
        const message = {
            message_id: 68,
            from: {
                id: 811391170,
                is_bot: false,
                first_name: 'José',
                last_name: 'Daniel',
                username: 'Josedan10',
                language_code: 'en',
            },
            chat: {
                id: -1001478666904,
                title: 'Trading Project ❤️',
                type: 'supergroup',
            },
            date: 1591559025,
            text: '/start@jd_trade_bot',
            entities: [
                {
                    offset: 0,
                    length: 19,
                    type: 'bot_command',
                },
            ],
        }
        return CommandHandler.getCommand(message).then((res) =>
            expect(res).toEqual(`start`)
        )
    })
})
