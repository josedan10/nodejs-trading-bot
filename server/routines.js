const CronJob = require('cron').CronJob
const telegramBot = require('../telegram/telegram-bot')
const bfx = require('../bitfinex/bfx')
const moment = require('moment')
const trader = require('../trader')

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
     * @param {String} statusName
     * @param {Array} timeFrame,
     * @param {Integer} chatID
     * @memberof TelegramBot
     *
     * WARNING: THIS IS NOT AN OPTIMAL PROCESS
     * This can saturate the server memory of routines. Handle this of a better way for all chats
     */
    async setRoutine(statusName, timeFrame, chatID) {
        const _this = this

        if (timeFrame === null || !timeFrame.length) {
            telegramBot.sendMessage(
                chatID,
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
                        chatID,
                        formatedCandle,
                        'MarkdownV2'
                    )
                } else {
                    telegramBot.sendMessage(
                        chatID,
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

    /**
     * Set a routine for trading strategy
     *
     * @param {Array} args [strategyName, symbol]
     * @param {Integer} chatID
     * @memberof ServerRoutine
     */
    async setStrategy(args, chatID) {
        trader.strategy = args[0]

        const routineString = '* * * * *'

        try {
            // Create the cronjob
            this.routines['strategy'] = new CronJob(routineString, async () => {
                // Get info and format it
                const candles = await bfx.getCandles(args, '1h', 40 * 4)

                telegramBot.sendMessage(
                    chatID,
                    JSON.stringify(trader.runStrategy(candles))
                )
            })

            this.routines.strategy.start()
        } catch (err) {
            throw Error(`[Strategy Routine]: ${err.toString()}`)
        }
    }
}

module.exports = new ServerRoutine()
