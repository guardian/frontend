/*
    Swallows (and reports) exceptions. Designed to wrap around modules at the "bootstrap" level.
    For example "comments throwing an exception should not stop auto refresh"
 */
define([
    'raven',
    'common/utils/_'
], function (
    raven,
    _
) {
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
        window.console.warn('Caught error.', error.stack);
        if (!reporter) {
            reporter = raven.captureException;
        }
        reporter(error, { tags: { module: name } });
    };

    var catchErrorsAndLog = function (name, fn, reporter) {
        var error = catchErrors(fn);
        if (error) {
            log(name, error, reporter);
        }
    };

    var catchErrorsAndLogAll = function (modules) {
        _.forEach(modules, function (pair) {
            var name = pair[0];
            var fn = pair[1];
            catchErrorsAndLog(name, fn);
        });
    };

    return {
        catchErrorsAndLog: catchErrorsAndLog,
        catchErrorsAndLogAll: catchErrorsAndLogAll
    };
});
