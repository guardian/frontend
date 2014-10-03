define([
    'socketio'
], function (io) {

    var options = {
            reconnection: false
        },
        log = function (msg) { window.console.log(msg); };

    function removeElement(id) {
        var oldStyle = document.querySelector('*[data-reload="' + id + '"]');
        if (oldStyle) {
            oldStyle.parentElement.removeChild(oldStyle);
        }
    }

    function init() {
        var loc = window.location,
            domain = loc.protocol + '//' + loc.hostname,
            reloadUrl = domain + ':8005',
            weinreUrl = domain + ':8006/target/target-script-min.js#anonymous',
            socket = io.connect(reloadUrl, options),
            head = document.head || document.getElementsByTagName('head')[0],
            body = document.body || document.getElementsByTagName('body')[0];

        socket.on('connect', function () {
            log('connected to devmode');
            log('dropping weinre...', weinreUrl);
            var weinreScript = document.createElement('script');
            weinreScript.src = weinreUrl;
            body.appendChild(weinreScript);
        });

        socket.on('disconnect', function () {
            log('disconnected. attempting to reconnect...');
            socket = io.connect(reloadUrl, options);
        });

        socket.on('css', function (data) {
            var css, style,
                asset = JSON.parse(data);

            log('received', asset.id, data.length);
            removeElement(asset.id);

            css = asset.data;
            style = document.createElement('style');

            style.type = 'text/css';
            style.setAttribute('data-reload', asset.id);
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        });

        socket.on('url', function (url) {
            log('url', url);
            window.location = url;
        });
    }

    return {
        init: init
    };
});
