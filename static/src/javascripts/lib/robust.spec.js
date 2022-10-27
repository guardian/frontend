import { convertError, reportError } from 'lib/report-error';
import { catchErrorsWithContext, _ } from './robust';

const { catchAndLogError } = _;

jest.mock('lib/report-error', () => ({
    convertError: jest.fn((e) => e),
	reportError: jest.fn(),
}));

let origConsoleWarn;

beforeEach(() => {
    jest.clearAllMocks();
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

        expect(convertError).toHaveBeenCalledTimes(1);
        expect(window.console.warn).toHaveBeenCalledTimes(1);
    });

    test('catchAndLogError() - default reporter with no error', () => {
        catchAndLogError('test', noError);
        expect(convertError).toHaveBeenCalledTimes(0);
        expect(reportError).not.toHaveBeenCalled();
    });

    test('catchAndLogError() - default reporter with error', () => {
        catchAndLogError('test', throwError);
        expect(convertError).toHaveBeenCalledTimes(1);
        expect(reportError).toHaveBeenCalledWith(ERROR, META, false);
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
