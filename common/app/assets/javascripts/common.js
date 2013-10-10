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
        },
        toArray : function(list) {
            return Array.prototype.slice.call(list);
        },
        lazyLoadCss: function(name, config) {
            // append server specific css
            bonzo(document.createElement('link'))
                .attr('rel', 'stylesheet')
                .attr('type', 'text/css')
                .attr('href', guardian.css[name])
                .appendTo(document.querySelector('body'));
        },
        hardRefresh: function(event) {
            // this means it will not load from the cache
            if (event) {
                event.preventDefault();
            }
            location.reload(true);
        },
        atob: window.atob ? function(str) { return window.atob(str); } : (function() {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                INVALID_CHARACTER_ERR = (function () {
                    // fabricate a suitable error object
                    try { document.createElement('$'); }
                    catch (error) { return error; }
                }());

            return function (input) {
                input = input.replace(/[=]+$/, '');
                if (input.length % 4 === 1) throw INVALID_CHARACTER_ERR;
                for (
                    // initialize result and counters
                        var bc = 0, bs, buffer, idx = 0, output = '';
                    // get next character
                        buffer = input.charAt(idx++);
                    // character found in table? initialize bit storage and add its ascii value;
                        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                            // and if not first of each 4 characters,
                            // convert the first 8 bits to one ascii character
                                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                        ) {
                    // try to find character in table (0-63, not found => -1)
                    buffer = chars.indexOf(buffer);
                }
                return output;
            };
        })(),
        requestAnimationFrame : function(callback) {
            var lastTime = 0,
                vendors = ['ms', 'moz', 'webkit', 'o'];

            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            } else {
                window.requestAnimationFrame(callback);
            }
        }
    }
});
