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

const log = (
    name: string,
    error: Error,
    reporter?: Function = reportError
): void => {
    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    reporter(error, { module: name }, false);
};

const catchErrorsAndLog = (
    name: string,
    fn: Function,
    reporter?: Function
): void => {
    const error = catchErrors(fn);

    if (error) {
        log(name, error, reporter);
    }
};

const catchErrorsAndLogAll = (modules: Array<any>): Array<any> =>
    modules.map(pair => {
        const [name, fn] = pair;
        catchErrorsAndLog(name, fn);
        return undefined;
    });

export default { catchErrorsAndLog, catchErrorsAndLogAll, log };
