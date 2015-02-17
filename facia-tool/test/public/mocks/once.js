define([
    'underscore'
], function (
    _
) {
    // Redefine the underscore once, some function must not be called
    // twice in the same test, reset it after unload
    var functionsCalled = {}, idGenerator = 0;
    _.once = function (fn) {
        var id = idGenerator++, memo;
        return function () {
            if (functionsCalled[id]) {
                return memo;
            }
            functionsCalled[id] = true;
            memo = fn.apply(this, arguments);
            return memo;
        };
    };

    _.once.reset = function () {
        functionsCalled = {};
    };
});
