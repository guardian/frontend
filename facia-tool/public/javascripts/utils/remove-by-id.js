/* global _: true */
define(function() {
    return function(observableArray, id) {
        return observableArray.remove(function(item) {
            return _.result(item, 'id') === id;
        })[0];
    };
});
