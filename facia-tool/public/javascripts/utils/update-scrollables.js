/* global _: true */
define([], function() {
    return function () {
        var height = window.innerHeight;

        Array.prototype.forEach.call(document.querySelectorAll('.scrollable'), function(el) {
            el.style.height = Math.max(100, height - el.getBoundingClientRect().top) - 2 + "px";
        });
    };
});
