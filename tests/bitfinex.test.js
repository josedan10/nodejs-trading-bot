const { telegram } = require('../config')
const bfx = require('../bitfinex/bfx')
const telegramBot = require('../telegram/telegram-bot')

describe('Tests of bitfinex API connection', () => {
    test('Connect with websocket server', async () => {
        bfx.startWS()
        bfx.ws.on('open', () => {
            telegramBot.sendMessage(
                telegram.telegramChatID,
                'Connected to websocket server'
            )
            expect(true).toBe(true)
        })
    })
})

describe('Test messages', () => {
    bfx.candleStatus.channelId = 5206

    const msgHB = [5206, 'hb']
    test('Candle update should be false: "hb"', () => {
        expect(bfx.isCandleUpdate(msgHB)).toBe(false)
    })

    const msgSnapshot = [
        5206,
        [
            [1590753600000, 9396.9, 9404.7, 9449, 9373.3, 175.78481269],
            [1590750000000, 9370.5, 9396.8, 9416.7, 9353.8, 142.6583545],
            [1590750000000, 9370.5, 9396.8, 9416.7, 9353.8, 142.6583545],
            [1590750000000, 9370.5, 9396.8, 9416.7, 9353.8, 142.6583545],
            [1590750000000, 9370.5, 9396.8, 9416.7, 9353.8, 142.6583545],
            [1590750000000, 9370.5, 9396.8, 9416.7, 9353.8, 142.6583545],
            [
                1590746400000,
                9464.81665015,
                9370.5,
                9471.8,
                9363.7,
                325.68438518,
            ],
            [
                1590742800000,
                9459.53903514,
                9464.81665015,
                9491.1,
                9434.5,
                418.85057192,
            ],
            [1590739200000, 9524.9, 9458.7, 9600, 9436, 665.17335616],
            [
                1590735600000,
                9519.92543576,
                9524.94032212,
                9543.6,
                9513,
                85.01159138,
            ],
            [1590732000000, 9521.4, 9519.9, 9552.1, 9510.9, 75.63131095],
            [
                1590728400000,
                9507.7,
                9521.91578659,
                9536.92059539,
                9487.5,
                77.7077278,
            ],
            [
                1590724800000,
                9527.670048,
                9507.59295416,
                9553.1,
                9506.9,
                94.1464954,
            ],
        ],
    ]
    test('Candle update should be false: snapshot', () => {
        expect(bfx.isCandleUpdate(msgSnapshot)).toBe(false)
    })

    msg = [5206, [1591585200000, 9720.6, 9726.9, 9727.1, 9720.5, 12.14348308]]

    test('Candle update should be works', () => {
        expect(bfx.isCandleUpdate(msg)).toBe(true)
    })
})
