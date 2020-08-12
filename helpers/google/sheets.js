/* eslint-disable camelcase */
const auth = require('./auth')
const { google } = require('googleapis')
const {
    google_sheets: { spreadsheet_id },
} = require('../../config')

/**
 * Handler of google sheets fetching
 *
 * @class GoogleSheetsHandler
 */
class GoogleSheetsHandler {
    /**
     *Creates an instance of GoogleSheetsHandler.
     * @param {Object} config
     * @param {GoogleAuthenticator} auth
     * @memberof GoogleSheetsHandler
     */
    constructor() {
        this.sheets = google.sheets({ version: 'v4', auth })
    }

    /**
     *  Update the google spreasheet adding new values
     *
     * @param {Array} values cell values
     * @param {String} sheetParams
     * @memberof GoogleSheetsHandler
     *
     * @return {Promise}
     */
    async updateSheet(values, sheetParams) {
        return new Promise((res, rej) => {
            this.sheets.spreadsheets.values.update(
                {
                    spreadsheetId: spreadsheet_id,
                    valueInputOption: 'RAW',
                    range: `${sheetParams.sheetName}!${sheetParams.range}`,
                    resource: {
                        values,
                    },
                },
                (err, result) => {
                    if (err) {
                        // Handle error
                        console.log(err)
                        rej(err)
                    } else {
                        // console.log('%d cells updated.', result.updatedCells)
                        res(result)
                    }
                }
            )
        })
    }
}

module.exports = new GoogleSheetsHandler()
