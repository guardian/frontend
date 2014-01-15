define(function() {

var context = document,
    contextualiser = {};

contextualiser.get = function() { return context; };
contextualiser.set = function(c) { context = c; };

return contextualiser;

}); // define
