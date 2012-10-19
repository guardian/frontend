define(['common'], function (common) {

    var Errors = function (w) {

        var path = '/px.gif',
            win = w || window,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.src = url;
                body.appendChild(image);
            },
            encode = function(str) { // https://gist.github.com/3912229
                var encodedStr = encodeURIComponent(str),
                    table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                for (var bits = '', i = 0; i < str.length; i++) {
                    bits += ('000' + str.charCodeAt(i).toString(4)).slice(-4);
                }
                bits += '000'.slice(bits.length % 3 || 3);
                for (var data = '', j = 0; j < bits.length; ) {
                    data += table.charAt(parseInt(bits.slice(j, j += 3), 4));
                }
                return data += '===='.slice(data.length % 4 || 4);
            },
            makeUrl = function(properties) {
                return path + '?js/' + encode(properties.join(','));
            },
            log = function(message, filename, lineno) {
                var url = makeUrl([message, filename, lineno]);
                createImage(url);
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

