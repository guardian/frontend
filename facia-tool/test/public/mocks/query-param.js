define('utils/fronts-from-url', function () {
    var queryParams = {};

    var getter = function () {
        return queryParams;
    };
    getter.set = function (params) {
        queryParams = params;
    };

    return getter;
});
