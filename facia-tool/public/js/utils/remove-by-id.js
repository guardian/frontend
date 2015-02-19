define([
    'underscore'
], function(
    _
) {
    return function(observableArray, id) {
        return observableArray.remove(function(item) {
            return _.result(item, 'id') === id;
        })[0];
    };
});
