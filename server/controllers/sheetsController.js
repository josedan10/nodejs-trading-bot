/**
 * Handle Google Sheets OAuth
 *
 * @param {*} req
 * @param {*} res
 */
function googleSheetsOAuth(req, res) {
    const { code } = req.query

    res.send({ code })
}

module.exports = {
    googleSheetsOAuth,
}
