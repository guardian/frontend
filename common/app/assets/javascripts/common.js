define(["vendor/EventEmitter-3.1.5", "bonzo", "qwery"], function(placeholder, bonzo, qwery) {
    return {
        mediator: new EventEmitter(),
    	$: function(selector) {
    		return bonzo(qwery(selector));
    	},
        $g: function(selector) {
            return qwery(selector);
        }
    }
});
