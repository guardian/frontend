import { _, catchErrorsWithContext } from './robust';

const { catchAndLogError } = _;

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

    test('catchAndLogError()', () => {
        expect(() => {
            catchAndLogError('test', noError);
        }).not.toThrowError();

        expect(() => {
            catchAndLogError('test', throwError);
        }).not.toThrowError(ERROR);

        expect(window.console.warn).toHaveBeenCalledTimes(1);
    });

    test('catchAndLogError() - default reporter', () => {
        reportErrorMock.mockClear();
        catchAndLogError('test', noError);
        expect(reportErrorMock).not.toHaveBeenCalled();

        reportErrorMock.mockClear();
        catchAndLogError('test', throwError);
        expect(reportErrorMock).toHaveBeenCalledWith(ERROR, META, false);
    });

    test('catchErrorsWithContext()', () => {
        const runner = jest.fn();

        const MODULES = [
            ['test-1', runner],
            ['test-2', runner],
            ['test-3', runner],
        ];

        catchErrorsWithContext(MODULES);
        expect(runner).toHaveBeenCalledTimes(MODULES.length);
    });
});
