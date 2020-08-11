/* eslint-disable camelcase */
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const {
    google_sheets: { client_id, redirect_uris, client_secret },
} = require('../../config')

/**
 * Controller of google sheets fetching
 *
 * @class GoogleSheetsController
 * @extends {google.auth.OAuth2}
 */
class GoogleSheetsController extends google.auth.OAuth2 {
    /**
     *Creates an instance of GoogleSheetsController.
     * @param {string} client_id
     * @param {string} client_secret
     * @param {string} redirect_uris
     * @memberof GoogleSheetsController
     */
    constructor(client_id, client_secret, redirect_uris) {
        super(client_id, client_secret, redirect_uris)

        // If modifying these scopes, delete token.json.
        this.SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        this.TOKEN_PATH = 'token.json'
    }

    /**
     * If the token not exist this call getNewToken function to get a new token
     *
     * @memberof GoogleSheetsController
     */
    authorize() {
        const _this = this

        // Check if we have previously stored a token.
        fs.readFile(_this.TOKEN_PATH, (err, token) => {
            if (err) return _this.getNewToken()
            _this.setCredentials(JSON.parse(token))
        })
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getNewToken() {
        const _this = this

        const authUrl = _this.generateAuthUrl({
            access_type: 'offline',
            scope: _this.SCOPES,
        })

        console.log('Authorize this app by visiting this url:', authUrl)
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close()
            _this.getToken(code, (err, token) => {
                if (err)
                    return console.error(
                        'Error while trying to retrieve access token',
                        err
                    )
                _this.setCredentials(token)
                // Store the token to disk for later program executions
                fs.writeFile(_this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err)
                    console.log('Token stored to', _this.TOKEN_PATH)
                })
            })
        })
    }
}

module.exports = new GoogleSheetsController(
    client_id,
    client_secret,
    redirect_uris
)
