/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */
define([
    'common/utils/report-error',
    'common/utils/_',
    'lodash/collections/forEach',
    'lodash/collections/map'
], function (
    reportError,
    _,
    forEach,
    map) {
    var catchErrors = function (fn) {
        var error;
        try {
            fn();
        } catch (e) {
            error = e;
        }
        return error;
    };

    var log = function (name, error, reporter) {
        if (window.console && window.console.warn) {
            window.console.warn('Caught error.', error.stack);
        }
        if (!reporter) {
            reporter = reportError;
        }
        reporter(error, { module: name }, false);
    };

    var catchErrorsAndLog = function (name, fn, reporter) {
        var error = catchErrors(fn);
        if (error) {
            log(name, error, reporter);
        }
    };

    var catchErrorsAndLogAll = function (modules) {
        forEach(modules, function (pair) {
            var name = pair[0];
            var fn = pair[1];
            catchErrorsAndLog(name, fn);
        });
    };

    function makeBlocks(codeBlocks) {
        return map(codeBlocks, function (record) {
            return catchErrorsAndLog.bind(this, record[0], record[1]);
        });
    }

    return {
        catchErrorsAndLog: catchErrorsAndLog,
        catchErrorsAndLogAll: catchErrorsAndLogAll,
        makeBlocks: makeBlocks
    };
});
