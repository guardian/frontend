define(["EventEmitter", "bonzo", "qwery"], function (EventEmitter, bonzo, qwery) {
    return {
        mediator: new EventEmitter(),
        $g: function (selector, context) {
            if (context) {
                return bonzo(qwery(selector, context));
            }
            return bonzo(qwery(selector));
        },
        deferToLoadEvent : function(ref) {
            if (document.readyState === 'complete') {
                ref();
            } else {
                window.addEventListener('load', function() {
                    ref();
                });
            }
        },
        extend : function(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        }
    };
});
