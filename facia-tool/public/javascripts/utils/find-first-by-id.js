define([
    'knockout'
], function(
    ko
) {
    return function(observableArray, id) {
        return ko.utils.arrayFirst(observableArray(), function(c) { return c.id() === id; });
    };
});
