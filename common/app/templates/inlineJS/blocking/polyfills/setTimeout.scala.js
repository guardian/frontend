@()

// Polyfill setTimeout args: https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers.setTimeout.
/*@@cc_on
    @@if (@@_jscript_version <= 9)
(function(f){
    window.setTimeout = f(window.setTimeout);
    window.setInterval = f(window.setInterval);
})(function(f){return function(c,t){var a=[].slice.call(arguments,2);return f(function(){c.apply(this,a)},t)}});
    @@end
@@*/
