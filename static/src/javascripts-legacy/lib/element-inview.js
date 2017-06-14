define([
    'bean',
    'lodash/functions/debounce',
    'lodash/objects/assign',
    'lib/noop',
], function(
    bean,
    debounce,
    assign,
    noop
) {
    // Be sure to wrap your event functions with fastdom as this doesn't assume DOM manipulation
    function elementIsInView(el, offsets_) {
        var offsets = assign({}, {left: 0, right: 0, top: 0, bottom: 0}, offsets_);

        var rect = el.getBoundingClientRect();
        var viewportHeight = window.innerHeight;
        var viewportWidth = window.innerWidth;

        var fromTop = rect.top + offsets.top;
        var fromBottom = rect.bottom - offsets.bottom;
        var fromLeft = rect.left - offsets.left;
        var fromRight = rect.right + offsets.right;

        var visibleVertically = fromTop < viewportHeight && fromBottom > 0;
        var visibleHorizontally = fromLeft < viewportWidth && fromRight > 0;

        return visibleVertically && visibleHorizontally;
    }



    function ElementInview(element, container, offsets) {
        var hasBeenSeen = false;

        var events = {
            firstview: noop.noop
        };

        bean.on(container, 'scroll', debounce(function() {
            var inView = elementIsInView(element, offsets);

            if (inView) {
                if (!hasBeenSeen) {
                    hasBeenSeen = true;
                    events.firstview(element);
                }
            }
        }, 200));

        return {
            on: function (event, func) {
                events[event] = func;
            }
        };
    }

    return ElementInview;
});
