/**
 * This module is used to merge calls to async functions that use callbacks. Ensuring the target function is
 * called once only but the result is passed to all the call backs that require it.
 */
define([], function () {
    /**
     * Creates a function that will merge calls to the supplied target function
     * @param {function} function to be merged, the function takes one argument, a callback that will
     * be called with the result of the async request
     * @return {?Date} the current date
     */
    function mergeCalls(targetFunction) {
        var callbacks;
        var status;
        var callbackArguments;

        function targetCallbackHandler() {
            callbackArguments = arguments;
            status = "complete";

            for(var i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(null, callbackArguments);
            }
        }

        function callMergingFunction(callback) {
            if(status === "init") {
                status = "waiting";
                callbacks.push(callback);
                targetFunction(targetCallbackHandler);
            } else if(status === "waiting") {
                callbacks.push(callback);
            } else {
                callback.apply(null, callbackArguments);
            }
        }

        function reset() {
            callbacks = [];
            status = "init";
            callbackArguments = null;
        }

        reset();

        callMergingFunction.reset = reset;

        return callMergingFunction;
    }

    return {
        mergeCalls : mergeCalls
    };
});