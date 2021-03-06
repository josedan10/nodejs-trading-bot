require('dotenv').config()

const { env } = process

const config = {
    telegram: {
        telegramAPIKey:
            env.APP_ENV === 'debug'
                ? env.TEST_TELEGRAM_BOT_API_KEY
                : env.TELEGRAM_API_KEY,
        telegramChatID:
            env.APP_ENV === 'debug'
                ? env.TEST_TELEGRAM_CHAT_ID
                : env.TELEGRAM_CHAT_ID,
        webhookURL: env.TELEGRAM_WEBHOOK_URL,
        telegramAPIURL: env.TELEGRAM_API_URL || 'https://api.telegram.org/bot',
    },
    bitfinex: {
        bitfinexAPIKey: env.BITFINEX_API_KEY,
        bitfinexSecret: env.BITFINEX_API_SECRET,
        bitfinexRESTAPIKey: env.BITFINEX_REST_API_KEY,
        bitfinexRESTSecret: env.BITFINEX_REST_API_SECRET,
        bitfinexPublicURL:
            env.BITFINEX_PUBLIC_URL || 'wss://api-pub.bitfinex.com/ws/2',
        bitfinexAuthURL: env.BITFINEX_AUTH_URL || 'wss://api.bitfinex.com/ws/2',
        bitfinexRESTPublicURL:
            env.BITFINEX_PUBLIC_REST_URL || 'https://api-pub.bitfinex.com/v2',
        bitfinexRESTAuthURL:
            env.BITFINEX_REST_AUTH_URL || `https://api.bitfinex.com/v2`,
    },
    server: {
        port: env.SERVER_PORT || env.PORT || 5000,
        url: env.SERVER_URL,
    },
    client: {
        url: env.APP_ENV === 'debug' ? env.CLIENT_TEST_URL : env.CLIENT_URL,
    },
    google_sheets: {
        client_id: env.GOOGLE_SHEETS_CLIENT_ID,
        project_id: env.GOOGLE_SHEETS_PROJECT_ID,
        auth_uri:
            env.GOOGLE_SHEETS_AUTH_URI ||
            'https://accounts.google.com/o/oauth2/auth',
        token_uri:
            env.GOOGLE_SHEETS_TOKEN_URI ||
            'https://oauth2.googleapis.com/token',
        auth_certs_url:
            env.GOOGLE_SHEETS_AUTH_CERTS_URL ||
            'https://www.googleapis.com/oauth2/v1/certs',
        client_secret: env.GOOGLE_SHEETS_CLIENT_SECRET,
        redirect_uris: [
            env.GOOGLE_SHEETS_REDIRECT_URIS ||
                'https://mysterious-brook-83261.herokuapp.com/OAuth/google-sheets',
        ],
        spreadsheet_id: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    },
}

module.exports = config
