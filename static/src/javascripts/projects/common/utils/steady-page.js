/*
 Utility: steady-insert.js
 Insert components into web-pages without jumping them around
 */

define([
    'common/utils/fastdom-promise'
], function (
    fastdom
) {
    /*
     * The callback should contain the functionality
     * to display the element (insertion, change of display).
     */
    function displayAndLayout (insertionCallback) {
        return fastdom.write(function(){
            // The callback should contain all
            insertionCallback();
        });
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
            var currentScrollPos = window.scrollY;
            var containerTopPos = insertionContainer.offsetTop;

            return displayAndLayout(insertionCallback).then(function(){
                if (currentScrollPos > containerTopPos) {
                    window.scrollTo(0, currentScrollPos + insertionContainer.scrollHeight);
                }
            });
        });
    }

    return {
        insert: insert
    }
});
