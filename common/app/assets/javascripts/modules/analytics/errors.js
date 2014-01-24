/*global Event:true */
define([
    'common/modules/userPrefs',
    'common/modules/analytics/beacon',
    'common/common'
], function (
    userPrefs,
    beacon,
    common
) {

    var Errors = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            cons = c.console || window.console,
            win = c.window || window,
            prefs = c.userPrefs || userPrefs,
            buildNumber = c.buildNumber || 'unknown',

            makeUrl = function(properties) {
                var query = [];

                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return '/js.gif?' + query.join('&');
            },

            log = function(message, filename, lineno, isUncaught) {
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
                    return (prefs.isOn('showErrors')) ? false : true;
                }
            },

            init = function() {
                win.onerror = function(message, filename, lineno) {
                    return log(message, filename, lineno, true);
                };
            };

        return {
            log: log,
            init: init
        };

    };

    return Errors;
});
