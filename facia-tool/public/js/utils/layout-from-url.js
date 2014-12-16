/* globals _ */
define([
    'utils/parse-query-params'
], function (
    parseQueryParams
) {
    function get () {
        var columns = [{
                'type': 'latest'
            }, {
                'type': 'front'
            }],
            configFromURL = parseQueryParams(window.location.search).layout;

        if (configFromURL) {
            columns = _.map(configFromURL.split(','), function (column) {
                if (!column) {
                    return {
                        type: 'front'
                    };
                }

                var parts = column.split(':');
                return {
                    type: parts[0],
                    config: parts[1]
                };
            });
        }

        return columns;
    }

    function serialize (layout) {
        return _.map(layout, function (column) {
            if ('config' in column) {
                return column.type + ':' + column.config;
            } else {
                return column.type;
            }
        }).join(',');
    }

    return {
        get: get,
        serialize: serialize
    };
});
