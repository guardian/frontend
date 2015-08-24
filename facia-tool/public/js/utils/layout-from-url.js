import _ from 'underscore';
import parseQueryParams from 'utils/parse-query-params';

function get (override, path) {
    var columns = path === 'config' ?
        [{ 'type': 'config' }, { 'type': 'config' }] :
        [{ 'type': 'latest' }, { 'type': 'front' }],
        queryParams = _.isObject(override) ? _.clone(override) : parseQueryParams(override),
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
        columns = path === 'config' ?
        [{ type: 'config', config: queryParams.front }] :
        [
            { type: 'latest' }, {
                type: 'front',
                config: queryParams.front
            }
        ];
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
