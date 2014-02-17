/* global _: true */
define([
    'knockout'
], function(
    ko
) {
    function init() {
        ko.bindingHandlers.makeHoverable = {
            init: function(element) {

                element.addEventListener('mouseover', function(event) {
                    var targetItem = ko.dataFor(event.target);

                    if (targetItem && targetItem.state && targetItem.state.underHover) {
                        targetItem.state.underHover(true);
                    }
                }, false);

                element.addEventListener('mouseout', function(event) {
                    var targetItem = ko.dataFor(event.target);

                    if (targetItem && targetItem.state && targetItem.state.underHover) {
                        targetItem.state.underHover(false);
                    }
                }, false);
            }
        };
    }

    return {
        init: _.once(init)
    };
});
