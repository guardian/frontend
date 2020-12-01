export default {
    wrap(fn: () => unknown): () => unknown {
        return fn;
    },
    captureException() {},
};
