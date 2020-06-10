const CronJob = require('cron').CronJob
const { telegram } = require('../config')
const telegramBot = require('../telegram/telegram-bot')
const bfx = require('../bitfinex/bfx')

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

        telegramBot.sendMessage(
            telegram.telegramChatID,
            bfx.candleStatus.candle
                ? bfx.candleStatus.candle.toString()
                : 'Rutina fijada'
        )

        const setRoutine = () => {
            _this.routines[statusName] = new CronJob('* * * * *', () => {
                telegramBot.sendMessage(
                    telegram.telegramChatID,
                    bfx.candleStatus.candle
                        ? bfx.candleStatus.candle.toString()
                        : 'Rutina fijada'
                )
            })

            _this.routines[statusName].start()
        }

        // It's not undefined or null
        if (_this.routines[statusName]) _this.routines[statusName].stop()

        setRoutine()
    }
}

module.exports = new ServerRoutine()
