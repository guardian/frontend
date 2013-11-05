define(function() {
    
//For throttling event bound function calls such as onScroll/onResize
//Thank you Remy Sharp: http://remysharp.com/2010/07/21/throttling-function-calls/
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}
return debounce;

}); // define