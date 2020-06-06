class TelegramBot {
  constructor (apiKey, chatID) {
    this.apiKey = apiKey
    this.chatID = chatID

    console.log('Bot initialized')
  }
}

module.exports = TelegramBot
