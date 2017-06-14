define([
    'lib/raven',
    'lib/fastdom-promise',
    'common/modules/spacefinder'
], function (
    raven,
    fastdom,
    spacefinder
) {
    function SpaceFiller() {
        this.queue = Promise.resolve();
    }

    /**
     * A safer way of using spacefinder.
     * Given a set of spacefinder rules, applies a writer to the first matching paragraph.
     * Uses fastdom to avoid layout-thrashing, but queues up asynchronous writes to avoid race conditions. We don't
     * seek a slot for a new component until all the other component writes have finished.
     *
     * @param rules - a spacefinder ruleset
     * @param writer - function, takes a para element and injects a container for the new content synchronously. It should NOT use Fastdom.
     * @param options - Options
     * @param options.domWriter - Override fastdom.write as the mechanism for queueing writes
     *
     * @returns {Promise} - when insertion attempt completed, resolves 'true' if inserted, or 'false' if no space found
     */
    SpaceFiller.prototype.fillSpace = function (rules, writer, options) {
        var write = (options && options.domWriter) || fastdom.write;
        return this.queue = this.queue.then(insertNextContent).catch(onError);

        function insertNextContent() {
            return spacefinder.findSpace(rules, options).then(onSpacesFound, onNoSpacesFound);
        }

        function onSpacesFound(paragraphs) {
            return write(function () {
                return writer(paragraphs);
            });
        }

        function onNoSpacesFound(ex) {
            if (ex instanceof spacefinder.SpaceError) {
                return false;
            } else {
                throw ex;
            }
        }
    };

    function onError(e) {
        // e.g. if writer fails
        raven.captureException(e);
        return false;
    }

    return new SpaceFiller();
});
