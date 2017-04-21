// @flow

let supportsOptions = false;

try {
    const opts = Object.defineProperty(
        {},
        'passive',
        ({
            get() {
                supportsOptions = true;
            },
        }: Object) // https://github.com/facebook/flow/issues/285
    );
    window.addEventListener('test', null, opts);
} catch (e) {
    /* noop */
}

const addEventListener = (
    node: Node,
    name: string,
    handler: Function,
    options: Object = {}
): void | false => {
    if (node) {
        if (supportsOptions) {
            node.addEventListener(name, handler, options);
        } else if (options.once) {
            node.addEventListener(
                name,
                function boundHandler(evt) {
                    handler.call(this, evt);
                    node.removeEventListener(name, boundHandler);
                },
                options.capture
            );
        } else {
            node.addEventListener(name, handler, options.capture);
        }
    }
};

export { addEventListener };
