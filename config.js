require('dotenv').config()

const { env } = process

const config = {
  telegram: {
    telegramAPIKey: env.TELEGRAM_API_KEY,
    telegramChatID: env.TELEGRAM_CHAT_ID
  },
  bitfinex: {
    bitfinexAPIKey: env.BITFINEX_API_KEY,
    bitfinexSecret: env.BITFINEX_API_SECRET
  }
}

module.exports = config
