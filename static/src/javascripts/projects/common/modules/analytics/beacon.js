define([
    'lodash/collections/map',
    'lodash/objects/isArray',
    'common/utils/config'
], function (
    map,
    isArray,
    config
) {

    return {
        fire: function (path) {
            var img = new Image();
            img.src = config.page.beaconUrl + path;

            return img;
        },
        counts: function (keys) {
            var query = map(isArray(keys) ? keys : [keys], function (key) {
                return 'c=' + key;
            }).join('&');

            return this.fire('/counts.gif?' + query);
        }
    };

});
