require('dotenv').config()

const { env } = process

const config = {
    telegram: {
        telegramAPIKey: env.TELEGRAM_API_KEY,
        telegramChatID: env.TELEGRAM_CHAT_ID,
        webhookURL: env.TELEGRAM_WEBHOOK_URL,
        telegramAPIURL: env.TELEGRAM_API_URL,
    },
    bitfinex: {
        bitfinexAPIKey: env.BITFINEX_API_KEY,
        bitfinexSecret: env.BITFINEX_API_SECRET,
        bitfinexPublicURL: env.BITFINEX_PUBLIC_URL,
    },
    server: {
        port: env.SERVER_PORT,
        url: env.SERVER_URL,
    },
}

module.exports = config
