/**
 * Format the wallet update payload
 * Wallet Update format:
 *
 *   [
 *       'exchange',
 *       'USD',
 *       0.002617709,
 *       0,
 *       0.002617709,
 *       'Exchange 0.012373 BTC for USD @ 10402.0',
 *       {
 *       reason: 'TRADE',
 *       order_id: 50864356396,
 *       order_id_oppo: 50866112131,
 *       trade_price: '10402.0',
 *       trade_amount: '0.012373'
 *       }
 *   ]
 *
 * @param {Array} wu
 * @param {Number} balance
 * @return {String}
 */
function formatWalletUpdate(wu, balance) {
    const msg = `
✨ NEW ACCOUNT STATUS!
        
💰 Balance: ${balance} USD.

Wallet Update

Type: ${wu[0]}
Currency: ${wu[1]}
Available: ${wu[4]}

Info: 
${JSON.stringify(wu.slice(5, wu.length))}
`

    return msg
}

/**
 * Format the signal msg
 *
 * @param {Object} signal
 * @return {String}
 */
function formatSignal(signal) {
    const msg = `${JSON.stringify(signal)}`

    return msg
}

module.exports = {
    formatWalletUpdate,
    formatSignal,
}
