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

const log = (module: string, error: Error): void => {
    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    reportError(error, { module }, false);
};

const catchErrorsAndLog = (name: string, fn: Function): void => {
    const error = catchErrors(fn);

    if (error) {
        log(name, error);
    }
};

const context = (modules: Array<any>): void =>
    modules.forEach(([name, fn]) => catchErrorsAndLog(name, fn));

export default { catchErrorsAndLog, context, log };
