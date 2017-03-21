// @flow

/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import reportError from 'lib/report-error';

function catchErrors(fn: Function): ?Error {
    let error;

    try {
        fn();
    } catch (e) {
        error = e;
    }

    return error;
}

function log(name: string, error: Error, customReporter?: Function): void {
    let reporter = reportError;

    if (customReporter) {
        reporter = customReporter;
    }

    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    reporter(error, { module: name }, false);
}

function catchErrorsAndLog(name: string, fn: Function, reporter?: Function) {
    const error = catchErrors(fn);

    if (error) {
        log(name, error, reporter);
    }
}

function catchErrorsAndLogAll(modules: Array<any>) {
    return modules.map(pair => {
        const [name, fn] = pair;
        catchErrorsAndLog(name, fn);
        return undefined;
    });
}

export default { catchErrorsAndLog, catchErrorsAndLogAll, log };
