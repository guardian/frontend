define([
    'underscore',
    'utils/deep-get',
    'utils/parse-query-params'
], function (
    _,
    deepGet,
    parseQueryParams
) {
    function getItem(dataTransfer, sourceGroup) {
        var id = dataTransfer.getData('Text'),
            mediaItem = dataTransfer.getData('application/vnd.mediaservice.crops+json'),
            sourceItem = dataTransfer.getData('sourceItem'),
            knownQueryParams = parseQueryParams(id, {
                namespace: 'gu-',
                excludeNamespace: false,
                stripNamespace: true
            }),
            unknownQueryParams = parseQueryParams(id, {
                namespace: 'gu-',
                excludeNamespace: true
            });

        if (mediaItem) {
            try {
                mediaItem = JSON.parse(mediaItem);
            } catch(e) {
                mediaItem = undefined;
            }

            if (!mediaItem) {
                throw new Error('Sorry, that image could not be understood.');
            } else {
                mediaItem = _.chain(mediaItem.assets)
                    .filter(function(asset) { return deepGet(asset, '.dimensions.width') <= 1000; })
                    .sortBy(function(asset) { return deepGet(asset, '.dimensions.width') * -1; })
                    .first()
                    .value();
            }

            if (!mediaItem) {
                throw new Error('Sorry, a suitable crop size does not exist for this image');
            }

        } else if (!id) {
            throw new Error('Sorry, you can\'t add that to a front');
        }

        if (sourceItem) {
            sourceItem = JSON.parse(sourceItem);
            sourceItem.front = (sourceGroup || {}).front;

        } else if (unknownQueryParams.url) {
            sourceItem = { id: unknownQueryParams.url };
            sourceGroup = undefined;

        } else {
            sourceItem = {
                id: id.split('?')[0] + (_.isEmpty(unknownQueryParams) ? '' : '?' + _.map(unknownQueryParams, function(val, key) {
                    return key + (val ? '=' + encodeURIComponent(val) : '');
                }).join('&')),
                meta: knownQueryParams
            };
            sourceGroup = undefined;
        }

        return {
            mediaItem: mediaItem,
            sourceItem: sourceItem,
            sourceGroup: sourceGroup
        };
    }

    return getItem;
});
