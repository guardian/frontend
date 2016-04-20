define([
    'common/utils/fastdom-promise',
    'Promise',
    'raven',
    'common/modules/article/spacefinder'
], function (
    fastdom,
    Promise,
    raven,
    spacefinder
) {
    var lastIteration;

    function SpaceFiller() {
        lastIteration = Promise.resolve(false);

        /**
         * A safer way of using spacefinder.
         * Given a set of spacefinder rules, applies a writer to the first matching paragraph.
         * Uses fastdom to avoid layout-thrashing, but queues up asynchronous writes to avoid race conditions. We don't
         * seek a slot for a new component until all the other component writes have finished.
         *
         * @param rules - a spacefinder ruleset
         * @param writer - function, takes a para element and injects a container for the new content synchronously. It should NOT use Fastdom.
         *
         * @returns {Promise} - when insertion attempt completed, resolves 'true' if inserted, or 'false' if no space found
         */
    }

    SpaceFiller.prototype.fillSpace = function (rules, writer) {
        return lastIteration = lastIteration.then(insertNextContent).catch(onInsertionError);

        function insertNextContent() {
            return spacefinder.findSpace(rules).then(insertionPromise);
        }

        function insertionPromise(slots) {
            return fastdom.write(function () {
                writer(slots);
                return true;
            });
        }
    };

    function onInsertionError(e) {
        raven.captureException(e);
        return false;
    }

    return new SpaceFiller();
});
