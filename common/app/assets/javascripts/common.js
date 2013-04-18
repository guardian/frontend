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
        },
        //For throttling event bound function calls such as onScroll/onResize
        //Thank you Remy Sharp: http://remysharp.com/2010/07/21/throttling-function-calls/
        debounce : function debounce(fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },
        rateLimit : function (fn, delay) {
            var delay = delay || 400,
                lastClickTime = 0;
            return function () {
                var context = this,
                    args = arguments,
                    current = new Date().getTime();

                if (! lastClickTime || (current - lastClickTime) > delay) {
                    lastClickTime = current;
                    fn.apply(context, args);
                }
            };
        }
    };
});
