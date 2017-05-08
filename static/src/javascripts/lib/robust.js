// @flow

/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import reportError from 'lib/report-error';

const catchErrors = (fn: Function): ?Error => {
    let error;

    try {
        fn();
    } catch (e) {
        error = e;
    }

    return error;
};

const logError = (module: string, error: Error): void => {
    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    reportError(error, { module }, false);
};

const catchAndLogError = (name: string, fn: Function): void => {
    const error = catchErrors(fn);

    if (error) {
        logError(name, error);
    }
};

const catchErrorsWithContext = (modules: Array<any>): void =>
    modules.forEach(([name, fn]) => catchAndLogError(name, fn));

export { catchErrorsWithContext, logError };
export const _ = { catchAndLogError };
