define([
    'lodash/collections/map',
    'common/utils/config'
], function (
    map,
    config
) {

    function format(keyword) {
        return keyword.replace(/[+\s]+/g, '-').toLowerCase();
    }

    function get() {
        return map(config.keywords.split(','), function (keyword) {
            return 'k=' + encodeURIComponent(format(keyword));
        }).join('&');
    }

    return {
        get: get,
        format: format
    };

});
