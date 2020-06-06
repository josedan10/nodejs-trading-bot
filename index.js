const config = require('./config')

// Telegram Bot
const TelegramBot = require('./telegram/bot')

function main () {
  // Start the app
  const bot = new TelegramBot(config.telegram.telegramAPIKey, config.telegram.telegramChatID)
  console.log(bot)
}

main()
