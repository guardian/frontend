// @flow

import reportError from 'lib/report-error';
import robust from './robust';

window.console.warn = jest.fn();

jest.mock('lib/report-error', () => jest.fn());

describe('robust', () => {
    const ERROR = new Error('Something broke.');
    const META = { module: 'test' };

    function noError() {
        return true;
    }

    function throwError() {
        throw ERROR;
    }

    test('catchErrorsAndLog()', () => {
        expect(() => {
            robust.catchErrorsAndLog('test', noError);
        }).not.toThrowError();

        expect(() => {
            robust.catchErrorsAndLog('test', throwError);
        }).not.toThrowError(ERROR);
    });

    test('catchErrorsAndLog() - default reporter', () => {
        reportError.mockClear();
        robust.catchErrorsAndLog('test', noError);
        expect(reportError).not.toHaveBeenCalled();

        reportError.mockClear();
        robust.catchErrorsAndLog('test', throwError);
        expect(reportError).toHaveBeenCalledWith(ERROR, META, false);
    });

    test('catchErrorsAndLog() - custom reporter', () => {
        const mockedCallback = jest.fn();
        robust.catchErrorsAndLog('test', noError, mockedCallback);
        expect(mockedCallback).not.toHaveBeenCalled();

        robust.catchErrorsAndLog('test', throwError, (err, meta) => {
            expect(err.message).toBe(ERROR.message);
            expect(meta.module).toBe('test');
        });
    });
});
