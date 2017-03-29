// @flow

import robust from './robust';

// #? Refactor this into a test utility with lots of magic?
jest.mock('lib/report-error', () => jest.fn());
const reportErrorMock: any = require('lib/report-error');

describe('robust', () => {
    const ERROR = new Error('Something broke.');
    const META = { module: 'test' };

    const noError = () => true;

    const throwError = () => {
        throw ERROR;
    };

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
        reportErrorMock.mockClear();
        robust.catchErrorsAndLog('test', noError);
        expect(reportErrorMock).not.toHaveBeenCalled();

        reportErrorMock.mockClear();
        robust.catchErrorsAndLog('test', throwError);
        expect(reportErrorMock).toHaveBeenCalledWith(ERROR, META, false);
    });

    test('context()', () => {
        const runner = jest.fn();

        const MODULES = [
            ['test-1', runner],
            ['test-2', runner],
            ['test-3', runner],
        ];

        robust.context(MODULES);
        expect(runner).toHaveBeenCalledTimes(MODULES.length);
    });
});
