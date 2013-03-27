define(['common'], function (common) {

    var Errors = function (w) {

        var url = "//beacon." + window.location.hostname,
            path = '/px.gif',
            win = w || window,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties) {
                return url + path + '?js/' + encodeURIComponent(properties.join(','));
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

