// @flow
import reportError_ from 'lib/report-error';
import { catchErrorsWithContext, logError } from './robust';

const reportError: any = reportError_;

jest.mock('lib/report-error', () => jest.fn());

describe('robust', () => {
    const ERROR = new Error('Something broke.');
    const throwError = () => {
        throw ERROR;
    };

    let origConsoleWarn;

    beforeEach(() => {
        origConsoleWarn = window.console.warn;
        window.console.warn = jest.fn();
    });

    afterEach(() => {
        window.console.warn = origConsoleWarn;
        reportError.mockReset();
    });

    describe('catchErrorsWithContext()', () => {
        let modules;

        const runner = jest.fn();

        beforeEach(() => {
            modules = [
                ['test-1', runner],
                ['test-2', runner],
                ['test-3', runner],
            ];
        });

        afterEach(() => {
            runner.mockReset();
        });

        it('executes all modules passed to it', () =>
            catchErrorsWithContext(modules).then(() => {
                expect(runner).toHaveBeenCalledTimes(modules.length);
            }));

        it('reports single error and resolves', () => {
            const testModules = [...modules, ['my-test-1', throwError]];
            return catchErrorsWithContext(testModules).then(() => {
                expect(runner).toHaveBeenCalledTimes(modules.length);
                expect(reportError).toHaveBeenCalledTimes(1);
                expect(reportError).toHaveBeenCalledWith(
                    ERROR,
                    { module: 'my-test-1' },
                    false
                );
                expect(window.console.warn).toHaveBeenCalledTimes(1);
            });
        });

        it('reports multiple errors and resolves', () => {
            const testModules = [
                ['my-test-1', throwError],
                ...modules,
                ['my-test-2', throwError],
            ];
            return catchErrorsWithContext(testModules).then(() => {
                expect(runner).toHaveBeenCalledTimes(modules.length);
                expect(reportError).toHaveBeenCalledTimes(2);
                expect(reportError).toHaveBeenCalledWith(
                    ERROR,
                    { module: 'my-test-1' },
                    false
                );
                expect(reportError).toHaveBeenCalledWith(
                    ERROR,
                    { module: 'my-test-2' },
                    false
                );
                expect(window.console.warn).toHaveBeenCalledTimes(2);
            });
        });

        it('accepts and executes async functions and resolves', () => {
            const asyncFunc = jest.fn(() => Promise.resolve());

            const testModules = [...modules, ['my-test-1', asyncFunc]];

            return catchErrorsWithContext(testModules).then(() => {
                expect(runner).toHaveBeenCalledTimes(modules.length);
                expect(asyncFunc).toHaveBeenCalledTimes(1);
                expect(reportError).not.toHaveBeenCalled();
            });
        });

        it('catches unhandled async errors and resolves', () => {
            const asyncFunc = jest.fn(
                () =>
                    new Promise(() => {
                        throw ERROR;
                    })
            );

            const testModules = [['my-test-1', asyncFunc], ...modules];

            return catchErrorsWithContext(testModules).then(() => {
                expect(runner).toHaveBeenCalledTimes(modules.length);
                expect(asyncFunc).toHaveBeenCalledTimes(1);
                expect(reportError).toHaveBeenCalledWith(
                    ERROR,
                    { module: 'my-test-1' },
                    false
                );
            });
        });
    });

    describe('logError', () => {
        it('calls report error if tags provided', () => {
            const testId = 'my-test-1';

            logError(testId, ERROR, {
                module: testId,
            });

            expect(window.console.warn).toHaveBeenCalledTimes(1);
            expect(reportError).toHaveBeenCalledWith(
                ERROR,
                { module: testId },
                false
            );
        });

        it('does not call report error if tags provided', () => {
            const testId = 'my-test-1';

            logError(testId, ERROR, {
                module: testId,
            });

            expect(window.console.warn).toHaveBeenCalledTimes(1);
            expect(reportError).toHaveBeenCalledWith(
                ERROR,
                { module: testId },
                false
            );
        });
    });
});
