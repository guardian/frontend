define([
    'underscore',
    'jquery',
    'jquery-mockjax'
], function (
    _,
    $
) {
    function scope () {
        var ids = [];

        var addMocks = function () {
            var mocks = [].slice.call(arguments, 0);
            _.each(mocks, function (mock) {
                ids.push($.mockjax(mock));
            });
        };

        addMocks.clear = function () {
            _.each(ids, function (id) {
                $.mockjax.clear(id);
            });
        };

        return addMocks;
    }

    return scope;
});
