/*
 Utility: steady-insert.js
 Insert components into web-pages without jumping them around by
 moving the current scroll position by the same distance as the height of the
 inserted element.
 Note: Inserted elements must have a fixed height when rendered
 (i.e: no changing the height by loading an image, lazy-loading content etc)
 */

define([
    'common/utils/fastdom-promise'
], function (
    fastdom
) {
    var currentFrameContainers = [];
    var currentScrollPos;
    var heightToAdd = 0;
    var options = {
        pixelGrace: 100 // Give the scroll some distance as it's likely the user has scrolled past the top of the screen
    };

    /*
     * Height with margins
     */
    function outerHeight(el) {
        var height = el.offsetHeight;
        var style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    /*
     * The callback should contain the functionality
     * to display the element (insertion, change of display).
     */
    function displayAndLayout (insertionCallback) {
        return fastdom.write(function(){
            insertionCallback();
        });
    }

    /*
     * Add the height of each inserted element within this animation frame
     * together so we know what the total height change required for
     * the scroll adjustment is
     */
    function getHeightAdjustment () {
        return fastdom.read(function(){
            for (var i = 0; i < currentFrameContainers.length; i++) {
                var currentContainer = currentFrameContainers[i];

                // The container should have an offsetTop,
                // be above our current scroll position
                // and have a height we can query
                if (currentContainer.offsetTop > -1 &&
                    currentScrollPos + options.pixelGrace > currentContainer.offsetTop &&
                    currentContainer.scrollHeight) {
                    heightToAdd += outerHeight(currentContainer);
                }
            }

            // Empty the container array once the loop is done
            currentFrameContainers = [];
        });
    }

    /*
     * The callback should contain the functionality
     * to display the element (insertion, change of display).
     */
    function scrollToHeight () {

            var newScrollPos = currentScrollPos + heightToAdd;

            // If we're not at the top of the page
            // and the height is more than nothing
            // and the current and new scroll positions aren't the same
            if ((currentScrollPos > 0 && heightToAdd > 0) &&
                (currentScrollPos !== newScrollPos)) {
                window.scrollTo(0, newScrollPos);
            }

            // Reset the current scroll position &
            // reset the height to add
            currentScrollPos = window.scrollY;
            heightToAdd = 0;
    }

    /*
     * Insert an element into the page
     * Use if your element doesn't exist and is inserted into a container
     * ** Don't use fastdom - it is handled in this utility **
     * @param {HTMLElement} insertionContainer The element that the component is being inserted into
     * @param {Function} insertionCallback Should contain all functionality that displays and lays-out the element
     */
    function insert (insertionContainer, insertionCallback) {
        return fastdom.read(function() {

            currentScrollPos = window.scrollY;

            // Push all the containers in the current fastdom read frame
            currentFrameContainers.push(insertionContainer);

            // Display, measure heights and then scrollTo
            return displayAndLayout(insertionCallback)
                .then(getHeightAdjustment)
                .then(scrollToHeight);
        });
    }

    return {
        insert: insert
    };
});
