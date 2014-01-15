define(['common/utils/contextualiser'], function(contextualiser) {

return (function() {
    var c = contextualiser.get();
    return c;
})();

//var c = document,
//    context = function() { return c; };
//
///** @param {Element} */
//context.set = function(newContext) {
//    c = newContext;
//};
//
//return context;

}); // define