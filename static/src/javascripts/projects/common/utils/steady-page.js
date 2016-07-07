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
            var containerTopPos = insertionContainer.offsetTop;

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

    // When inserting, converting or removing elements that adjust
    // the flow of an article, we must use an anchor point to measure
    // the difference made to the scroll position to elements below
    function articleAdjustment (el, convertCallback) {
        return fastdom.read(function(){
            var currentScrollPos = document.body.scrollTop;
            var elTop = el.offsetTop;
            var submetaEl = document.getElementsByClassName('submeta')[0];
            var prevAnchorTop = submetaEl.offsetTop;
            console.log(document.body.scrollTop)
            fastdomAdjustmentCallback(convertCallback).then(function(){
                if (currentScrollPos > elTop) {
                    console.log('true dat')
                    var anchorPosDiff = prevAnchorTop - submetaEl.offsetTop;
                    document.body.scrollTop = currentScrollPos - anchorPosDiff;
                    console.log(document.body.scrollTop)
                }
            });
        });
    }



    return {
        insert: insert,
        articleAdjustment: articleAdjustment
    }
});
