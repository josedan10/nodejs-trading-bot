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
     * @param {Array} timeFrame
     * @memberof TelegramBot
     */
    async setRoutine(statusName, timeFrame) {
        const _this = this

        if (timeFrame === null || !timeFrame.length) {
            telegramBot.sendMessage(
                telegram.telegramChatID,
                'I need the time interval to set the routine. Type `/help` to see more details.'
            )
            return
        }

        const num = timeFrame[0].match(/\d+/g)[0]
        const unit = timeFrame[0].match(/[a-zA-Z]+/g)[0]
        const mins = moment().minute()

        const routineString = `${unit === 'mins' ? '*/' + num : mins} *${
            unit === 'hrs' ? '/' + num : ''
        } * * *`

        const setRoutine = () => {
            _this.routines[statusName] = new CronJob(routineString, () => {
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
