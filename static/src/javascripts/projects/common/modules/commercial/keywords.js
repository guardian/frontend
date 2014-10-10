define([
    'lodash/collections/map'
], function (
    map
) {

    function format(keyword) {
        return keyword.replace(/[+\s]+/g, '-').toLowerCase();
    }

    function get(config) {
        return map(config.keywords.split(','), function (keyword) {
            return 'k=' + encodeURIComponent(format(keyword));
        }).join('&');
    }

    return {
        get: get,
        format: format
    };

});
