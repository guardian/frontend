// @flow

let dpTimeout: ?TimeoutID = null;
const dpQueue = [];
const onClearTimeoutQueue = [];

const onClearTimeout = fn => {
    onClearTimeoutQueue.push(fn);
};

const debouncedPromise = (
    onSuccess: () => Promise<void>,
    ms: number = 2000
): Promise<void> => {
    if (dpTimeout) clearTimeout(dpTimeout);
    onClearTimeoutQueue.forEach(fn => fn());

    dpQueue.push(
        new Promise(success => {
            onClearTimeout(success);
            dpTimeout = setTimeout(() => {
                success(onSuccess());
            }, ms);
        })
    );

    return Promise.race(dpQueue).then(args => {
        dpQueue.length = 0;
        onClearTimeoutQueue.length = 0;
        return args;
    });
};

export default debouncedPromise;
