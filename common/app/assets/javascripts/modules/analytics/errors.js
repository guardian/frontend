define([
    'common/modules/analytics/beacon'
], function (
    beacon
) {

    var isDev,
        cons,
        win,
        buildNumber;

    function makeUrl(properties) {
        var query = [];

        for (var name in properties) {
            query.push(name + '=' + encodeURIComponent(properties[name]));
        }
        return '/js.gif?' + query.join('&');
    }

    function log(message, filename, lineno, isUncaught) {
        // error events are thrown by script elements
        if (message.toString() === '[object Event]' && message.target instanceof HTMLScriptElement) {
            message = 'Syntax or http error: ' + message.target.src;
        }
        var errorType = 'js';
        if (filename === 'common/modules/adverts/documentwriteslot.js' || message === 'Script error.') {
            errorType = 'ads';
        }

        var error = {
            message: message,
            filename: filename,
            lineno: lineno,
            build: buildNumber,
            type: errorType
        };
        if (isDev) {
            if (isUncaught !== true) {
                cons.error(error);
            }
            return false;
        } else {
            beacon.fire(makeUrl(error));
            return (!/#showErrors/.test(win.location.hash));
        }
    }

    function init(config) {
        isDev = config.isDev || false;
        cons = config.console || window.console;
        win = config.window || window;
        buildNumber = config.buildNumber || 'unknown';

        win.onerror = function(message, filename, lineno) {
            return log(message, filename, lineno, true);
        };
    }

    return {
        log: log,
        init: init
    };

});
