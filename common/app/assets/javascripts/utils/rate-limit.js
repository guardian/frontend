define(function() {

function rateLimit(fn, delay) {
    var lastClickTime = 0;
    delay = delay || 400;

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
return rateLimit;

}); // define