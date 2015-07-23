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
        if (window.console && window.console.warn) {
            window.console.warn('Caught error.', error.stack);
        }
        if (!reporter) {
            reporter = raven.captureException;
        }
        reporter(error, { tags: { module: name } });
    };

    var catchErrorsAndLog = function (name, fn, reporter) {
        //console.log('JD running', name);
        var error = catchErrors(fn);
        if (error) {
            log(name, error, reporter);
        }
    };

    var catchErrorsAndLogAll = function (modules) {
        var pair = _.head(modules);
        if (pair) {
            requestAnimationFrame(function () {
                var name = pair[0];
                var fn = pair[1];
                catchErrorsAndLog(name, function () {
                    fn();
                    catchErrorsAndLogAll(_.tail(modules));
                });
            });
        }
    };

    function makeBlocks(codeBlocks) {
        return _.map(codeBlocks, function (record) {
            return catchErrorsAndLog.bind(this, record[0], record[1]);
        });
    }

    return {
        catchErrorsAndLog: catchErrorsAndLog,
        catchErrorsAndLogAll: catchErrorsAndLogAll,
        makeBlocks: makeBlocks
    };
});
