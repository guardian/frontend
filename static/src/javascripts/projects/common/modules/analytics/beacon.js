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
        postJson: function (path, jsonString, forceAjax) {
            var url = (config.page.beaconUrl || '').replace(/^\/\//, 'http://') + path;

            if ('sendBeacon' in navigator && !forceAjax) {
                window.addEventListener('unload', function () {
                    navigator.sendBeacon(url, jsonString);
                }, false);
            } else {
                ajax({
                    url: url,
                    type: 'json',
                    method: 'post',
                    contentType: 'application/json',
                    data: jsonString,
                    crossOrigin: true
                });
            }
        },
        counts: function (keys) {
            var query = map(isArray(keys) ? keys : [keys], function (key) {
                return 'c=' + key;
            }).join('&');

            return this.fire('/counts.gif?' + query);
        }
    };

});
