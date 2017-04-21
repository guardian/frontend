let supportsOptions = false;
try {
    const opts = Object.defineProperty({}, 'passive', {
        get() {
            supportsOptions = true;
        }
    });
    window.addEventListener('test', null, opts);
} catch (e) { /* noop */ }

export default addEventListener;

function addEventListener(node, eventName, eventHandler, options = {}) {
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
