/**
 * This module is used to merge calls to async functions that use callbacks. Ensuring the target function is
 * called once only but the result is passed to all the call backs that require it.
 */




/**
 * Creates a function that will merge calls to the supplied target function
 */
const mergeCalls = (targetFunction) => {
    let callbacks;
    let callbackArguments;
    let status;

    const reset = () => {
        [callbacks, status, callbackArguments] = [[], 'init', []];
    };

    const targetCallbackHandler = (...args) => {
        callbackArguments = args;
        status = 'complete';
        callbacks.forEach(callback => {
            callback(...callbackArguments);
        });
    };

    const callMergingFunction = callback => {
        if (status === 'init') {
            status = 'waiting';
            callbacks.push(callback);
            targetFunction(targetCallbackHandler);
        } else if (status === 'waiting') {
            callbacks.push(callback);
        } else {
            callback(...callbackArguments);
        }
    };

    reset();

    callMergingFunction.reset = reset;

    return callMergingFunction;
};

export { mergeCalls };
