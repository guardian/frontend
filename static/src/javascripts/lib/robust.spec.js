// @flow

import { catchErrorsAndLog, context } from './robust';

// #? Refactor this into a test utility with lots of magic?
jest.mock('lib/report-error', () => jest.fn());
const reportErrorMock: any = require('lib/report-error');

let origConsoleWarn;

beforeEach(() => {
    origConsoleWarn = window.console.warn;
    window.console.warn = jest.fn();
});

afterEach(() => {
    window.console.warn = origConsoleWarn;
});

describe('robust', () => {
    const ERROR = new Error('Something broke.');
    const META = { module: 'test' };

    const noError = () => true;

    const throwError = () => {
        throw ERROR;
    };

    test('catchErrorsAndLog()', () => {
        expect(() => {
            catchErrorsAndLog('test', noError);
        }).not.toThrowError();

        expect(() => {
            catchErrorsAndLog('test', throwError);
        }).not.toThrowError(ERROR);

        expect(window.console.warn).toHaveBeenCalledTimes(1);
    });

    test('catchErrorsAndLog() - default reporter', () => {
        reportErrorMock.mockClear();
        catchErrorsAndLog('test', noError);
        expect(reportErrorMock).not.toHaveBeenCalled();

        reportErrorMock.mockClear();
        catchErrorsAndLog('test', throwError);
        expect(reportErrorMock).toHaveBeenCalledWith(ERROR, META, false);
    });

    test('context()', () => {
        const runner = jest.fn();

        const MODULES = [
            ['test-1', runner],
            ['test-2', runner],
            ['test-3', runner],
        ];

        context(MODULES);
        expect(runner).toHaveBeenCalledTimes(MODULES.length);
    });
});
