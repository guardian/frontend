define([
    'lodash/functions/partialRight'
], function (
    partialRight
) {
    return function chain(value) {
        // We make a new chainable with each operation to prevent mutations and
        // thus allow multiple usages of a given chainable.
        var makeChainable = function (value) {
            var chainable = {
                and: function () {
                    // Spread
                    var fn = partialRight.apply(null, arguments);
                    var newValue = fn(value);
                    return makeChainable(newValue);
                },
                value: function () { return value; },
                // Override prototype method
                valueOf: function () { return this.value(); }
            };
            var selfReturningArrayMethods = [
                'concat',
                'join',
                'reverse',
                'sort'
            ];
            var nonSelfReturningArrayMethods = [
                'slice',
                'shift',
                'pop',
                'push',
                'splice',
                'unshift'
            ];
            selfReturningArrayMethods.forEach(function (methodName) {
                chainable[methodName] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var newValue = Array.prototype[methodName].apply(value, args);
                    return makeChainable(newValue);
                };
            });
            nonSelfReturningArrayMethods.forEach(function (methodName) {
                chainable[methodName] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    Array.prototype[methodName].apply(value, args);
                    return makeChainable(value);
                };
            });
            return chainable;
        };

        return makeChainable(value);
    };
});
