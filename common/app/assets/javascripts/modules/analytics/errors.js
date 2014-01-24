/*global Event:true */
define([
    'common/modules/userPrefs',
    'common/common'
], function (
    userPrefs,
    common
) {

    var Errors = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            url = config.beaconUrl,
            cons = c.console || window.console,
            win = c.window || window,
            prefs = c.userPrefs || userPrefs,
            buildNumber = c.buildNumber || 'unknown',

            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'u-h';
                image.src = url;
                document.body.appendChild(image);
            },

            makeUrl = function(properties) {
                var query = [];

                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return url + '/js.gif?' + query.join('&');
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
                    var url = makeUrl(error);
                    createImage(url);
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
