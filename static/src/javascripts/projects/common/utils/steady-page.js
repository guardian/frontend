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
    'common/utils/Queue',
    'common/utils/config'
], function (
    fastdom,
    Promise,
    assign,
    Queue,
    config
) {

    var q = Queue;
    var running = false;
    var promise;

    /**
     * Given a batch and a previous currentBatchHeight, measure the height of each container
     * in the batch
     *
     * @param  {Array} batch
     */
    function getHeightOfAllContainers (batch) {
        return fastdom.read(function() {
            // Add all the heights of the passed in batch
            // removing the current height
            return batch.filter(elementIsAbove).reduce(function(height, insertion) {
                return height + readHeight(insertion.container);
            }, 0);
        });

        function elementIsAbove(el) {
            var parentElArray = [];
            var parentEl = el.container;
            var viewportAdjustment = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 2;

            // Push the container's parents into an array so we can calculate
            // the position of the elements all the way until the body
            while (parentEl) {
                parentElArray.push(parentEl);
                parentEl = parentEl.offsetParent;
            }

            // Get the top position of the element + half of the viewport (to account for an element loading
            // just below the top of the viewport)
            var elTopPos = parentElArray.reduce(function(topPos, parentEl){
                // This will loop up the parents until the body taking into account all the positions
                // so that if an element is equal to the scrollY position then this will return 0
                return topPos + parentEl.offsetTop + parentEl.clientTop;
            }, 0) - viewportAdjustment;

            // If the distance of the element from the top of the page minus the height of the
            // element we are measuring is less than the scroll position then we know that it will
            // push the page down when loading in
            return el.container.offsetHeight > -1 &&
                window.scrollY > 0 &&
                (elTopPos - el.container.offsetHeight < window.scrollY);
        }

        function readHeight(el) {
            var style = getComputedStyle(el);
            var height = el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
            return isNaN(height) ? 0 : height;
        }
    }


    /**
     * Given a batch, call all of the callbacks on the insertion object
     *
     * @param  {Array} batch
     */
    function insertElements (batch) {
        return fastdom.write(function () {
            batch.forEach(function (insertion) {
                insertion.cb();
            });
        });
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
                getHeightOfAllContainers(batch);
            })
            .then(function(heightsBeforeIns) {
                batchHeightsBeforeInsert = heightsBeforeIns || 0;
                return insertElements(batch);
            })
            .then(function(){
                return getHeightOfAllContainers(batch).then(function(newHeights) {
                    return assign(state, {
                        newHeight: newHeights - batchHeightsBeforeInsert
                    });
                });
            })
            .then(function(state){
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
            });

        return promise;

    }

    function scrollThePage (scrollY) {
        if (scrollY) {
            window.scrollTo(0, scrollY);
            running = false;
        }
    }

    /**
     * Insert an element into the page
     * Use if your element doesn't exist and is inserted into a container
     * ** Don't use fastdom - it is handled in this utility **
     * @param {HTMLElement} container The element that the component is being inserted into
     * @param {Function} cb Should contain all functionality that displays and lays-out the element
     */
    function insert(container, cb) {
        if (!config.switches.steadyPageUtil) {
            return fastdom.write(cb);
        }

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
        insert: insert,
        _tests: {
            getHeightOfAllContainers: getHeightOfAllContainers,
            insertElements: insertElements
        }
    };
});
