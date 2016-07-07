/*
 Module: steady-insert.js
 Description: Insert components into web-pages without jumping them around
 */

define([
    'common/utils/fastdom-promise'
], function (
    fastdom
) {
    /*

     */
    function fastdomAdjustmentCallback (insertionCallback) {
        return fastdom.write(function(){
            // Call all the bits inside
            insertionCallback();
        });
    }

    // Insert an element into the page
    // Use if your element doesn't exist and is inserted into a container
    function insert (insertionContainer, insertionCallback, insertBelow) {
        return fastdom.read(function(){
            var currentScrollPos = document.body.scrollTop;
            var containerTopPos = insertionContainer.scrollTop;

            if (insertBelow) {
                containerTopPos = containerTopPos + insertionContainer.scrollHeight;
            }

            fastdomAdjustmentCallback(insertionCallback).then(function(){
                if (currentScrollPos > containerTopPos) {
                    document.body.scrollTop = currentScrollPos + insertionContainer.scrollHeight;
                }
            });
        })
    }

    // Convert an existing element to a different height
    // Use if your element shifts from one height to a new height
    function convert (convertEl, convertCallback) {
        return fastdom.read(function(){
            var currentScrollPos = document.body.scrollTop;
            var convertElPos = convertEl.scrollTop;
            var convertElPrevHeight = convertEl.scrollHeight;

            console.log(currentScrollPos, 'Convert: currentScrollPos');
            console.log(convertElPos, 'Convert: convertElPos');
            console.log(convertElPrevHeight, 'Convert: convertElPrevHeight');

            fastdomAdjustmentCallback(convertCallback).then(function(){
                console.log(currentScrollPos > convertElPos, 'Convert: scrollAbove')
                console.log(currentScrollPos + (convertEl.scrollHeight - convertElPrevHeight), 'Convert: newScrollPos')
                if (currentScrollPos > convertElPos) {
                    document.body.scrollTop = currentScrollPos + (convertEl.scrollHeight - convertElPrevHeight);
                }
            });
        });
    }

    // Remove from the page flow
    // Use this if your element effect elements below by removing itself and causing
    // those elements to shift upwards
    function remove (removeEl, removeCallback) {
        return fastdom.read(function(){
            var currentScrollPos = document.body.scrollTop;
            var convertElPos = removeEl.scrollTop;
            var removeElPrevHeight = removeEl.scrollHeight;

            fastdomAdjustmentCallback(removeCallback).then(function(){
                if (currentScrollPos > convertElPos) {
                    document.body.scrollTop = currentScrollPos - removeElPrevHeight;
                }
            });
        });
    }

    return {
        insert: insert,
        convert: convert,
        remove: remove
    }
});
