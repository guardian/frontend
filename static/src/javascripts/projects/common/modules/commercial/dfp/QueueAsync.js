define([
    'Promise'
], function (
    Promise
) {
    /**
     * Queue up asynchronous functions to run one-at-a-time.
     * When the first function's promise resolves, the second runs, and so on.
     * If any function throws an error, that is captured by the errorHandler.
     */
    return function QueueAsync(errorHandler) {
        var runningOperation = Promise.resolve();

        this.add = function add(operation) {
            runningOperation = runningOperation.then(operation).catch(errorHandler);
            return runningOperation;
        };
    };
});
