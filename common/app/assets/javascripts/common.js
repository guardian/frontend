define(["EventEmitter", "bonzo", "qwery"], function (placeholder, bonzo, qwery) {
    return {
        mediator: new EventEmitter(),
        $g: function (selector, context) {
            if (context) {
                return bonzo(qwery(selector, context));
            }
            return bonzo(qwery(selector));
        },
        // x-brower way of grabbing clicked element
        getTargetElement: function (event) {
            var target;

            if (!event) { return; }

            if (event.target) { // modern browsers
                target = event.target;
            } else if (event.srcElement) { // IE
                target = event.srcElement;
            }

            // safari bug (returns textnode, not element)
            if (target.nodeType === 3) {
                target = target.parentNode;
            }

            return target;
        }
    };
});
