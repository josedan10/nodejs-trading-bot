const CronJob = require('cron').CronJob
const { telegram } = require('../config')
const telegramBot = require('../telegram/telegram-bot')
const bfx = require('../bitfinex/bfx')
const moment = require('moment')

/**
 * Routines controller
 *
 * @class ServerRoutine
 */
class ServerRoutine {
    /**
     *Creates an instance of ServerRoutine.
     * @memberof ServerRoutine
     */
    constructor() {
        this.routines = {}
    }

    /**
     * Set a routine for 5 minutes meanwhile
     *
     * @param {*} statusName
     * @param {*} timeFrame
     * @memberof TelegramBot
     */
    async setRoutine(statusName, timeFrame) {
        const _this = this

        const setRoutine = () => {
            _this.routines[statusName] = new CronJob('*/3 * * * *', () => {
                const { candle } = bfx.candleStatus

                if (candle) {
                    const formatedCandle = `
                    *Update \\(timeframe \\= 1H\\)*

                    LAST PRICE: $${candle[2]
                        .toFixed(2)
                        .toString()
                        .replace('.', '\\.')}

                    *time:* ${moment(candle[0]).format('DD/MM/YYYY  HH:mm')}
                    *open:* $${candle[1]
                        .toFixed(2)
                        .toString()
                        .replace('.', '\\.')}
                    *high:* $${candle[3]
                        .toFixed(2)
                        .toString()
                        .replace('.', '\\.')}
                    *low:* $${candle[4]
                        .toFixed(2)
                        .toString()
                        .replace('.', '\\.')}
                    *close:* $${candle[2]
                        .toFixed(2)
                        .toString()
                        .replace('.', '\\.')}
                    *volume:* ${candle[5].toString().replace('.', '\\.')} BTC`
                    telegramBot.sendMessage(
                        telegram.telegramChatID,
                        formatedCandle,
                        'MarkdownV2'
                    )
                } else {
                    telegramBot.sendMessage(
                        telegram.telegramChatID,
                        'No hay datos disponibles aún'
                    )
                }
            })

            _this.routines[statusName].start()
        }

        // It's not undefined or null
        if (_this.routines[statusName]) _this.routines[statusName].stop()

        setRoutine()
    }
}

module.exports = new ServerRoutine()
