define(['common'], function (common) {

    var Errors = function (w, n) {

        var host = '//gu-pix.appspot.com',
            path = '/px/frontend/e/1',
            w = w || window,
            n = n || navigator,
            body = document.getElementsByTagName('body')[0],
            createImage = function(url) {
                var image = new Image();
                image.id = 'cs-err';
                image.src = url; 
                body.appendChild(image);
            },
            utf8_to_b64 = function(str) {
                    return window.btoa(unescape(encodeURIComponent(str)));
            },
            makeUrl = function(properties) {
                return host + path + '?tag=' + utf8_to_b64(properties.join(','));
            },
            log = function(err) {
                var message = err.message,
                    ln = err.lineno,
                    filename = err.filename;
                createImage(makeUrl([message, ln, filename, n.userAgent]));
            },
            init = function() {
                w.addEventListener('error', log);
            } 
        
        return {
            log: log,
            init: init
        }
        
    };

    return Errors;
});

