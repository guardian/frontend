define(function () {
    var supportsOptions = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsOptions = true;
            }
        });
        window.addEventListener('test', null, opts);
    } catch (e) { /* noop */ }

    return addEventListener;

    function addEventListener(node, eventName, eventHandler, options) {
        options = options || {};

        if (supportsOptions) {
            node.addEventListener(eventName, eventHandler, options);
        } else if (options.once) {
            node.addEventListener(eventName, function boundEventHandler(evt) {
                eventHandler.call(this, evt);
                node.removeEventListener(eventName, boundEventHandler);
            }, options.capture);
        } else {
            node.addEventListener(eventName, eventHandler, options.capture);
        }
    }
});
