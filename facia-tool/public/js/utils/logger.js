/* globals Raven */
define(function () {
    function call (what) {
        return function () {
            window.console[what].apply(window.console, arguments);
            if (what === 'error') {
                try {
                    throw new Error([].slice.call(arguments, 0).join(' '));
                } catch (ex) {
                    Raven.captureException(ex);
                }
            }
        };
    }

    return {
        log: call('log'),
        error: call('error')
    };
});
