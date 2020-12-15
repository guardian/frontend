let supportsOptions = false;

try {
    const opts = Object.defineProperty(
        {},
        'passive',
        ({
            get() {
                supportsOptions = true;
            },
        }) // https://github.com/facebook/flow/issues/285
    );
    window.addEventListener('test', null, opts);
} catch (e) {
    /* noop */
}

const addEventListener = (
    node,
    name,
    handler,
    { passive = false, capture = false, once = false } = {}
) => {
    if (supportsOptions) {
        node.addEventListener(name, handler, { passive, capture, once });
    } else if (once) {
        node.addEventListener(
            name,
            function boundHandler(evt) {
                handler.call(this, evt);
                node.removeEventListener(name, boundHandler);
            },
            capture
        );
    } else {
        node.addEventListener(name, handler, capture);
    }
};

export { addEventListener };
