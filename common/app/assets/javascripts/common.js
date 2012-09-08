define(["vendor/EventEmitter-3.1.5", "bonzo", "qwery"], function(placeholder, bonzo, qwery) {
    return {
        mediator: new EventEmitter(),
        $g: function(selector, context) {
            if (context) {
                return bonzo(qwery(selector, context));    
            }
            return bonzo(qwery(selector));
        }
    }
});
