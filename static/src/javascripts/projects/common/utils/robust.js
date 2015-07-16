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
            console.warn('Caught error.', e.stack);
        }
        return error;
    };

    var log = function (name, error) {
        raven.captureException(e, { tags: { module: name } });
    };

    var catchErrorsAndLog = function (name, fn) {
        var error = catchErrors(fn);
        if (error) {
            log(name, error);
        }
    };

    var catchErrorsAndLogAll = function (modules) {
        _.forEach(modules, function (pair) {
            var name = pair[0];
            var fn = pair[1];
            catchErrorsAndLog(name, fn);
        })
    };

    return {
        catchErrorsAndLog: catchErrorsAndLog,
        catchErrorsAndLogAll: catchErrorsAndLogAll
    };
});
