define(["EventEmitter", "bonzo", "qwery"], function (placeholder, bonzo, qwery) {
    return {
        mediator: new EventEmitter(),
        $g: function (selector, context) {
            if (context) {
                return bonzo(qwery(selector, context));
            }
            return bonzo(qwery(selector));
        },

        throttle: function(fn, delay) {
	        var timer = null;
	        return function () {
	            var context = this, args = arguments;
	            clearTimeout(timer);
	            timer = setTimeout(function () {
	                fn.apply(context, args);
	            }, delay);
	        };
	    }
    };
});
