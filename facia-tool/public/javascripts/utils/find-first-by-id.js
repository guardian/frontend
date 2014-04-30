/* global _: true */
define([
    'knockout'
], function(
    ko
) {
    return function(observableArray, id) {
        return ko.utils.arrayFirst(observableArray(), function(c) { return _.result(c, 'id') === id; });
    };
});
