/*
 Utility: steady-insert.js
 Insert components into web-pages without jumping them around by
 moving the current scroll position by the same distance as the height of the
 inserted element.
 Note: Inserted elements must have a fixed height when rendered
 (i.e: no changing the height by loading an image, lazy-loading content etc)
 */

define([
    'common/utils/fastdom-promise',
    'Promise',
    'lodash/objects/assign',
    'common/utils/Queue'
], function (
    fastdom,
    Promise,
    assign,
    Queue
) {

    var q = Queue;
    var running = false;
    var promise;

    /**
     * Given a batch and a previous currentBatchHeight, measure the height of each container
     * in the batch
     *
     * @param  {Array} batch
     * @param  {Number} state.scrollY
     */
    function getHeightOfAllContainers (batch, state) {
        return fastdom.read(function() {
            // Add all the heights of the passed in batch
            // removing the current height
            return batch.filter(elementIsAbove).reduce(function(height, insertion) {
                return height + readHeight(insertion.container);
            }, 0);
        });

        function elementIsAbove(el) {
            return el.container.offsetTop > -1 &&
                state.scrollY + 100 > el.container.offsetTop &&
                el.container.offsetHeight;
        }

        function readHeight(el) {
            var style = getComputedStyle(el);
            var height = el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
            return isNaN(height) ? 0 : height;
        }
    }

    /**
     * Given a batch
     *
     * This doesn't use fastdom as it's already called from inside a fastdom read
     *
     * @param  {Array} batch
     * @param  {Object} state
     */
    function insertElements (batch) {
        return fastdom.write(function () {
            batch.forEach(function (insertion) {
                insertion.cb();
            });
        });
    }

    /**
     * Calculate the new height and either scroll or run the next batch of updates
     *
     * @param  {Number} state.height The total height of elements in the previous recursions
     * @param  {Number} state.newHeight The height of all the elements added in the current recursion level
     */
    function calculateScrollY (state) {
        if (q.empty()) {
            // If the queue is empty (no more elements need to be added to the page) we immediately scroll
            return state.newHeight + state.prevHeight + state.scrollY;
        } else {
            // If there are elements waiting to be added to the page we take the previous container's heights
            // and recursively call the function so that we only scroll the page once the queue is empty -
            // this prevents excessive and jarring scrolling
            return go(assign(state, {
                prevHeight: state.prevHeight + state.newHeight
            }));
        }
    }

    /**
     * Process the insertion operation:
     *
     *   1. Calculate the original height of the container
     *   2. Apply the insertion functions for all inserted elements
     *   3. Calculate the new height of the container
     *   4. Adjust the scroll position to account for the new container height
     *
     * @param  {Number} state.scrollY The original scroll position
     */
    function go(state) {
        running = true;

        var batch = [];
        var batchHeightsBeforeInsert;



        promise = fastdom.read(function(){
                while (!q.empty()) {
                    // Take the current queue items and add them to the batch array
                    var insertion = q.dequeue();
                    batch.push(insertion);
                }

                return batch;
            })
            .then(function(){
                getHeightOfAllContainers(batch, state);
            })
            .then(function(heightsBeforeIns) {
                batchHeightsBeforeInsert = heightsBeforeIns || 0;
                return insertElements(batch);
            })
            .then(function(){
                return getHeightOfAllContainers(batch, state).then(function(newHeights) {
                    return assign(state, {
                        newHeight: newHeights - batchHeightsBeforeInsert
                    });
                });
            })
            .then(calculateScrollY);

        return promise;

    }

    function scrollThePage (scrollY) {
        window.scrollTo(0, scrollY);
        running = false;
    }

    /**
     * Insert an element into the page
     * Use if your element doesn't exist and is inserted into a container
     * ** Don't use fastdom - it is handled in this utility **
     * @param {HTMLElement} insertionContainer The element that the component is being inserted into
     * @param {Function} insertionCallback Should contain all functionality that displays and lays-out the element
     */
    function insert(container, cb) {
        var initialState = {
            scrollY: window.scrollY,
            prevHeight: 0
        };

        q.enqueue({
            container: container,
            cb: cb
        });

        return (running ? promise : go(initialState)).then(scrollThePage);
    }

    return {
        insert: insert
    };
});
