// @flow

export default {
    wrap(fn: () => mixed): () => mixed {
        return fn;
    },
    captureException() {},
};
