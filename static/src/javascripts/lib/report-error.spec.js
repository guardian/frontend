// @flow

import reportError from './report-error';

describe('report-error', () => {
    const error = new Error('Something broke');
    const meta = {
        test: true,
    };

    test('Throws an error', () => {
        expect(reportError(error, meta)).toThrow('Something broke');
    });
});
