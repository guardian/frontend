define(["vendor/EventEmitter-3.1.5", "bonzo", "qwery"], function(placeholder, bonzo, qwery) {
    return {
        pubsub: new EventEmitter(),
    	$: function(selector) {
    		return bonzo(qwery(selector));
    	}
    }
});
