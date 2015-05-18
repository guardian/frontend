import Raven from 'raven-js';

let logger = {};

function call (what) {
    return function () {
        var scope = logger.console || window.console,
            raven = logger.Raven || Raven;

        scope[what].apply(scope, arguments);
        if (what === 'error') {
            try {
                throw new Error([].slice.call(arguments, 0).join(' '));
            } catch (ex) {
                raven.captureException(ex);
            }
        }
    };
}

logger.log = call('log');
logger.error = call('error');

export default logger;
