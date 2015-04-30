import _ from 'underscore';
import parseQueryParams from 'utils/parse-query-params';

function get (override) {
    var columns = [{
            'type': 'latest'
        }, {
            'type': 'front'
        }],
        queryParams = parseQueryParams(override),
        configFromURL = queryParams.layout;

    if (queryParams.treats === 'please') {
        columns = [{
            type: 'clipboard'
        }, {
            type: 'treats',
            config: queryParams.front
        }];
    } else if (configFromURL) {
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
    } else if (queryParams.front) {
        columns = [{
            type: 'latest'
        }, {
            type: 'front',
            config: queryParams.front
        }];
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

export {
    get,
    serialize
};
