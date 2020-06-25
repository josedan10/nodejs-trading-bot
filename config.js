require('dotenv').config()

const { env } = process

const config = {
    telegram: {
        telegramAPIKey:
            env.APP_ENV === 'debug'
                ? env.TEST_TELEGRAM_BOT_API_KEY
                : env.TELEGRAM_API_KEY,
        telegramChatID:
            env.APP_ENV === 'debug'
                ? env.TEST_TELEGRAM_CHAT_ID
                : env.TELEGRAM_CHAT_ID,
        webhookURL: env.TELEGRAM_WEBHOOK_URL,
        telegramAPIURL: env.TELEGRAM_API_URL || 'https://api.telegram.org/bot',
    },
    bitfinex: {
        bitfinexAPIKey: env.BITFINEX_API_KEY,
        bitfinexSecret: env.BITFINEX_API_SECRET,
        bitfinexPublicURL:
            env.BITFINEX_PUBLIC_URL || 'wss://api-pub.bitfinex.com/ws/2',
    },
    server: {
        port: env.SERVER_PORT || env.PORT || 5000,
        url: env.SERVER_URL,
    },
}

module.exports = config
