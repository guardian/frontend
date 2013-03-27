define(['modules/userPrefs', 'common'], function (userPrefs, common) {

    var Errors = function (config) {

        var c = config || {},
            isDev = (c.isDev !== undefined) ? c.isDev : false,
            url = "//beacon." + window.location.hostname,
            path = '/px.gif',
            cons = c.console || window.console,
            win = c.window || window,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties) {
                var query = [];
                for (var name in properties) {
                    query.push(name + '=' + encodeURIComponent(properties[name]));
                }
                return url + path + '?js/' + query.join('&');
            },
            log = function(message, filename, lineno) {
                var error = {
                    message: message.toString(),
                    filename: filename,
                    lineno: lineno,
                    isad: (filename === 'modules/adverts/documentwriteslot.js' || message === 'Script error.') ? 1 : 0
                };
                
                if (isDev) {
                    cons.error(error);
                } else {
                    var url = makeUrl(error);
                    createImage(url);
                }
                return (userPrefs.isOn('showErrors')) ? false : true;
            },
            init = function() {
                win.onerror = log;
            };

        return {
            log: log,
            init: init
        };

    };

    return Errors;
});
