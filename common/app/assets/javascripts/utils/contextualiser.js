define([], function() {

var Contextualiser = {},
    context = document;

/** @return {Element} */
Contextualiser.get = function() {
//    console.log('Should be twitce')
    return context;
};

/** @param {Element} */
Contextualiser.set = function(c) {
    context = c;
};

return Contextualiser;

});