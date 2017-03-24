// @flow

import reportError from 'lib/report-error';
import robust from './robust';

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
        // mock window.console.warn, to check whether it was called
        const origConsoleWarn = window.console.warn;
        window.console.warn = jest.fn();

        expect(() => {
            robust.catchErrorsAndLog('test', noError);
        }).not.toThrowError();

        expect(() => {
            robust.catchErrorsAndLog('test', throwError);
        }).not.toThrowError(ERROR);

        expect(window.console.warn).toHaveBeenCalledTimes(1);

        // reset window.console.warn
        window.console.warn = origConsoleWarn;
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

    test('catchErrorsAndLogAll()', () => {
        const runner = jest.fn();

        const MODULES = [
            ['test-1', runner],
            ['test-2', runner],
            ['test-3', runner],
        ];

        robust.catchErrorsAndLogAll(MODULES);
        expect(runner).toHaveBeenCalledTimes(MODULES.length);
    });
});
