// @flow

import raven from 'raven';
import reportError from './report-error';

jest.mock('raven', () => ({
    captureException: jest.fn(),
}));

describe('report-error', () => {
    const error = new Error('Something broke.');
    const metaData = { test: true };
    const ravenMetaData = { tags: metaData };

    test('Does not throw an error', () => {
        expect(() => {
            reportError(error, metaData, false);
        }).not.toThrowError(error);

        expect(raven.captureException).toHaveBeenCalledWith(
            error,
            ravenMetaData
        );
    });

    test('Throws an error', () => {
        expect(() => {
            reportError(error, metaData);
        }).toThrowError(error);

        expect(raven.captureException).toHaveBeenCalledWith(
            error,
            ravenMetaData
        );
    });
});
