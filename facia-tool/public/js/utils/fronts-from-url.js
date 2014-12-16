define([
    'utils/parse-query-params'
], function (
    parseQueryParams
) {
    return function () {
        return parseQueryParams(window.location.search, {
            multipleValues: true
        }).front || [];
    };
});
