module.exports = [
    {
        command: 'start',
        description: 'Connect to the api server',
    },
    {
        command: 'subscribe',
        description: 'Subscribe to candle updates',
    },
    {
        command: 'strategy',
        description: 'Show strategy results',
    },
    {
        command: 'routine',
        description: `Send signals by intervals, using words "mins" or "hrs" to set it`,
    },
    {
        command: 'screenshot',
        description: `Send an screenshot from client app of BTC market on 3hrs candels`,
    },
    {
        command: 'help',
        description: 'Show the bot info',
    },
    {
        command: 'stop',
        description: 'Stop the bot server',
    },
]
