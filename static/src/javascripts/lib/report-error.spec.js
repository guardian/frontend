// @flow

import reportError from './report-error';

describe('report-error', () => {
    const error = new Error('Something broke.');
    const meta = {
        test: true,
    };

    test('Does not throw an error', () => {
        expect(() => {
            reportError(error, meta, false);
        }).not.toThrowError(error);
    });

    test('Throws an error', () => {
        expect(() => {
            reportError(error, meta);
        }).toThrowError(error);
    });
});
