define([
    'lodash/collections/map',
    'lodash/objects/isArray',
    'common/utils/config',
    'common/utils/ajax'
], function (
    map,
    isArray,
    config,
    ajax
) {

    return {
        fire: function (path) {
            var img = new Image();
            img.src = config.page.beaconUrl + path;

            return img;
        },
        postJson: function (path, jsonString) {
            return ajax({
                url: config.page.beaconUrl + path,
                type: 'json',
                method: 'post',
                contentType: 'application/json',
                data: jsonString,
                crossOrigin: true
            });
        },
        counts: function (keys) {
            var query = map(isArray(keys) ? keys : [keys], function (key) {
                return 'c=' + key;
            }).join('&');

            return this.fire('/counts.gif?' + query);
        }
    };

});
