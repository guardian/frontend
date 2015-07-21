@()
@import conf.Static
@import conf.Configuration

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// needed due to class manipulation in bonzo is not x-browser - https://github.com/ded/bonzo/pull/133
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// JSON support needed for raven
if (typeof JSON !== 'object') {
    var s = document.createElement('script'),
    sc = document.getElementsByTagName('script')[0];
    s.src = '@Static("javascripts/components/JSON-js/json2.js")';
    sc.parentNode.insertBefore(s, sc);
}

@* It's faster to pass arguments in setTimeout than to use an anon function, but IE <10 can't do that. *@
// Polyfill setTimeout args: https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers.setTimeout.
/* @@cc_on
@@if (@@_jscript_version <= 6)
(function (f) {window.setTimeout = f(window.setTimeout)})(function (f) {
    return function (c, t) {
        var a = [].slice.call(arguments, 2);
        return f(function () {
                c.apply(this, a)
            }, t);
        }
    }
);
@@end
@@*/

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
