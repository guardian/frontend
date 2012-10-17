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
            encode = function(str) {
                return encodeURIComponent(str);
            },
            makeUrl = function(properties) {
                return path + '?' + encode(properties.join(','));
            },
            log = function(err) {
                var url = makeUrl([err.message, err.lineno, err.filename]);
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

