const routinesServer = require('../server/routines')

describe('Test the routines', () => {
    test('The routine should be added at the "routines" object', () => {
        routinesServer.setRoutine('candlesUpdate', '1h')
        expect(routinesServer.routines).not.toBeFalsy()
    })
})
