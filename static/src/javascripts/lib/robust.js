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

function log(name: string, error: Error): void {
    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    reportError(error, { module: name }, false);
}

function catchErrorsAndLog(name: string, fn: Function, reporter?: Function) {
    const error = catchErrors(fn);

    if (error) {
        log(name, error, reporter);
    }
}

function catchErrorsAndLogAll(modules: Array<any>) {
    modules.forEach(pair => catchErrorsAndLog(pair[0], pair[1]));
}

function makeBlocks(codeBlocks: Array<any>) {
    return codeBlocks.map(record =>
        catchErrorsAndLog.bind(this, record[0], record[1]));
}

export default { catchErrorsAndLog, catchErrorsAndLogAll, makeBlocks, log };
