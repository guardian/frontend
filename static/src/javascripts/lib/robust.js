// @flow

/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */

import reportError from 'lib/report-error';

const logError = (
    module: string,
    error: Error,
    tags: ?{ [key: string]: string }
): void => {
    if (window.console && window.console.warn) {
        window.console.warn('Caught error.', error.stack);
    }

    if (tags) {
        reportError(error, Object.assign({ module }, tags), false);
    } else {
        reportError(error, { module }, false);
    }
};

const catchAndLogError = (
    name: string,
    fn: Function,
    tags: ?{ [key: string]: string }
): Promise<any> => {
    try {
        /*
         * fn could be sync/async we therefore use Promise.all as
         * this will only resolve once a sync function returns or an async
         * function resolves.
         */
        return Promise.all([fn()]).catch(error => {
            // uncaught async errors end up here - catch and log them
            logError(name, error, tags);
        });
    } catch (error) {
        // sync errors end up here - catch and log them
        logError(name, error, tags);
        return Promise.resolve();
    }
};

const catchErrorsWithContext = (
    modules: Array<any>,
    tags: ?{ [key: string]: string }
): Promise<any> => {
    const pendingModules = [];

    modules.forEach(([name, fn]) => {
        pendingModules.push(catchAndLogError(name, fn, tags));
    });

    /*
     * The modules array can contain sync and async functions.
     * Returning a Promise.all means we can wait for all the sync
     * functions to have returned and all the async functions to have resolved.
     */
    return Promise.all(pendingModules).then(results => {
        const flattenedResults = [].concat(...results);

        return Promise.resolve(flattenedResults);
    });
};

export { catchErrorsWithContext, logError };
