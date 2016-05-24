@()
@import conf.Static
@import conf.Configuration

// JSON support needed for raven
if (typeof JSON !== 'object') {
    (function (document) {
        var s = document.createElement('script'),
        sc = document.getElementsByTagName('script')[0];
        s.src = '@Static("javascripts/components/JSON-js/json2.js")';
        sc.parentNode.insertBefore(s, sc);
    })(document);
}

@* It's faster to pass arguments in setTimeout than to use an anon function, but IE <10 can't do that. *@
// Polyfill setTimeout args: https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers.setTimeout.
/*@@cc_on
    @@if (@@_jscript_version <= 9)
        (function(f){
            window.setTimeout = f(window.setTimeout);
            window.setInterval = f(window.setInterval);
        })(function(f){return function(c,t){var a=[].slice.call(arguments,2);return f(function(){c.apply(this,a)},t)}});
    @@end
@@*/

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function (window) {
    var lastTime, vendors;

    if (!window.requestAnimationFrame) {
        lastTime = 0;
        vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

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
}(window));
