define(['common'], function (common) {

    var Errors = function (w) {

        var host = '//gu-pix.appspot.com',
            path = '/px/frontend/e/1',
            win = w || window,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.src = url;
                body.appendChild(image);
            },
            encode = function(str) {
                return encodeURIComponent(str);
            },
            makeUrl = function(properties) {
                return host + path + '?tag=' + encode(properties.join(','));
            },
            log = function(e) {
                var url = makeUrl([e.message, e.lineno, e.filename, win.location.href, win.navigator.userAgent]);
                createImage(url);
            },
            init = function() {
                win.addEventListener('error', log);
            };
        
        return {
            log: log,
            init: init
        };
        
    };

    return Errors;
});

