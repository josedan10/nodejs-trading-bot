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

    /**
     *  Append values to spreadsheet
     *
     * @param {Array} values cell values
     * @param {String} sheetParams
     * @return {Promise}
     * @memberof GoogleSheetsHandler
     */
    async appendToSheet(values, sheetParams) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.append(
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
                        reject(err)
                    } else {
                        // console.log('%d cells updated.', result.updatedCells)
                        resolve(result)
                    }
                }
            )
        })
    }

    /**
     *
     *
     * @param {String} sheetName
     * @return {Promise} last row of sheet
     * @memberof GoogleSheetsHandler
     */
    async getLastRow(sheetName) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get(
                {
                    spreadsheetId: spreadsheet_id,
                    range: `${sheetName}!A2:F`,
                },
                (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        const { values } = res.data
                        const lastRow = values[values.length - 1]

                        resolve(lastRow)
                    }
                }
            )
        })
    }

    /**
     *  Get data from google sheets
     *
     * @param {String} sheetName
     * @param {String} range
     * @return {Promise} array
     * @memberof GoogleSheetsHandler
     */
    async getEntireSheetData(sheetName, range) {
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get(
                {
                    spreadsheetId: spreadsheet_id,
                    range: `${sheetName}!${range}`,
                },
                (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        const { values } = res.data
                        resolve(values)
                    }
                }
            )
        })
    }
}

module.exports = new GoogleSheetsHandler()
