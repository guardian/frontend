define([
    'underscore',
    'knockout'
], function (
    _,
    ko
) {
    return function(observableArray, id) {
        return ko.utils.arrayFirst(observableArray(), function(c) { return _.result(c, 'id') === id; });
    };
});
