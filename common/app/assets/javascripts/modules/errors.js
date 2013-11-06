/*global Event:true */
define(['modules/userPrefs', 'common'], function (userPrefs, common) {

    var Errors = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            url = config.beaconUrl,
            path = '/px.gif',
            cons = c.console || window.console,
            win = c.window || window,
            body = document.body,
            prefs = c.userPrefs || userPrefs,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'u-h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties, isAd) {
                var query = [];
                properties.type = (isAd === true) ? 'ads' : 'js';
                properties.build = c.buildNumber || 'unknown';
                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return url + path + '?' + query.join('&');
            },
            log = function(message, filename, lineno, isUncaught) {
                // error events are thrown by script elements
                if (message.toString() === '[object Event]' && message.target instanceof HTMLScriptElement) {
                    message = 'Syntax or http error: ' + message.target.src;
                }
                var error = {
                    message: message,
                    filename: filename,
                    lineno: lineno,
                };
                if (isDev) {
                    if (isUncaught !== true) {
                        cons.error(error);
                    }
                    return false;
                } else {
                    var url = makeUrl(error, (filename === 'modules/adverts/documentwriteslot.js' || message === 'Script error.'));
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
