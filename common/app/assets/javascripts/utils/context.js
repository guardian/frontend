define(function() {

var c = document,
    context = function() { return c; };

/** @param {Element} */
context.set = function(newContext) {
    c = newContext;
};

return context;

}); // define