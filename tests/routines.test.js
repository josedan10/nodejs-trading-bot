const routinesServer = require('../server/routines')

describe('Test the routines', () => {
    test('The routine should be added at the "routines" object', async () => {
        await routinesServer.setRoutine('candlesUpdate', ['1mins'])
        expect(routinesServer.routines['candlesUpdate']).not.toBeFalsy()
    })
})
