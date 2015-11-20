/* jscs:disable disallowDanglingUnderscores */
define([
    'common/utils/$',
    'common/utils/fastdom-idle',
    'Promise',
    'raven',
    'common/modules/article/spacefinder'
], function (
    $,
    idleFastdom,
    Promise,
    raven,
    spacefinder
) {
    return new SpaceFiller();

    function SpaceFiller() {
        var lastInsertion = Promise.resolve(false);

        /**
         * A safer way of using spacefinder.
         * Given a set of spacefinder rules, applies a writer to the first matching paragraph.
         * Uses fastdom to avoid layout-thrashing, but queues up asynchronous writes to avoid race conditions. We don't
         * seek a slot for a new component until all the other component writes have finished.
         *
         * @param rules - a spacefinder ruleset
         * @param writer - function, takes a para element and injects a container for the new content synchronously. It should NOT use Fastdom.
         * @param debug - flag to enable debugging in spacefinder
         *
         * @returns {Promise} - when insertion attempt completed, resolves 'true' if inserted, or 'false' if no space found
         */
        this.insertAtFirstSpace = function insertAtFirstSpace(rules, writer, debug) {
            lastInsertion = lastInsertion.then(function insertNextContent() {
                return spacefinder.getParaWithSpace(rules, debug).then(function applyParaToWriter(para) {
                    if (para) {
                        return promiseInsertion(para);
                    } else {
                        return false;
                    }
                });
            });

            function promiseInsertion(para) {
                return new Promise(function (resolve) {
                    idleFastdom.write(function () {
                        try {
                            writer(para);
                            resolve(true);
                        } catch (e) {
                            // log and move on
                            raven.captureException(e);
                            resolve(false);
                        }
                    });
                });
            }

            return lastInsertion;
        };
    }
});
