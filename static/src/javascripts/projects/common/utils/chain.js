define([
    'lodash/functions/partialRight'
], function (
    partialRight
) {
    // We make a new chainable with each operation to prevent mutations and
    // thus allow multiple usages of a given chainable.

    var createObject = function (prototype) {
        if (Object.create) {
            return Object.create(prototype);
        } else {
            var F = function () {};
            F.prototype = prototype;
            return new F();
        }
    };

    var makeChainable = function (value, object) {
        var chainable = createObject(object);
        chainable.setValue(value);
        return chainable;
    };

    // Chainable prototype
    var Chainable = {
        setValue: function (value) {
            this.__value = value;
        },
        and: function () {
            // Spread
            var fn = partialRight.apply(null, arguments);
            var newValue = fn(this.value());
            return makeChainable(newValue, this);
        },
        value: function () { return this.__value; },
        // Override prototype method
        valueOf: function () { return this.value(); }
    };

    // Add array methods to chainable

    var immutableArrayMethods = [
        'concat',
        'join',
        'reverse',
        'sort'
    ];
    var mutableArrayMethods = [
        'slice',
        'shift',
        'pop',
        'push',
        'splice',
        'unshift'
    ];
    immutableArrayMethods.forEach(function (methodName) {
        Chainable[methodName] = function () {
            var args = Array.prototype.slice.call(arguments);
            var newValue = Array.prototype[methodName].apply(this.value(), args);
            return makeChainable(newValue, this);
        };
    });
    mutableArrayMethods.forEach(function (methodName) {
        Chainable[methodName] = function () {
            var args = Array.prototype.slice.call(arguments);
            Array.prototype[methodName].apply(this.value(), args);
            return makeChainable(this.value(), this);
        };
    });

    return function (value) {
        return makeChainable(value, Chainable);
    };
});
