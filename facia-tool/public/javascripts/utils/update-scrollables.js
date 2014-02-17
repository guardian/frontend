/* global _: true */
define([], function() {
    return function () {
        var height = $(window).height();
        $('.scrollable').each(function() {
            $(this).height(Math.max(100, height - $(this).offset().top) - 2);
        });
    };
});
