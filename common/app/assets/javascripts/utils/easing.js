define(function () {
    'use strict';

    // utility module for creating basic easing functions
    // Usage:
    // var ease = easing.create('easeOutQuint', 3000); // creates a 3 second duration easing function
    // ease(); // each call will return a value from 0 (at t=0) to 1.0 (at t>=duration)

    var easingFunctions = { // https://gist.github.com/gre/1650294
        // no easing, no acceleration
        linear: function (t) { return t; },
        // accelerating from zero velocity
        easeInQuad: function (t) { return t*t; },
        // decelerating to zero velocity
        easeOutQuad: function (t) { return t*(2-t); },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
        // accelerating from zero velocity
        easeInCubic: function (t) { return t*t*t; },
        // decelerating to zero velocity
        easeOutCubic: function (t) { return (--t)*t*t+1; },
        // acceleration until halfway, then deceleration
        easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
        // accelerating from zero velocity
        easeInQuart: function (t) { return t*t*t*t; },
        // decelerating to zero velocity
        easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
        // accelerating from zero velocity
        easeInQuint: function (t) { return t*t*t*t*t; },
        // decelerating to zero velocity
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
        // acceleration until halfway, then deceleration
        easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
    };

    function createEasingFn(type, duration) {
        var startTime = new Date();
        var ease = easingFunctions[type];
        return function () {
            var elapsed = (new Date()) - startTime;
            return ease(Math.min(1, elapsed / duration));
        };
    }

    return {
        functions: easingFunctions,
        create: createEasingFn
    };

});