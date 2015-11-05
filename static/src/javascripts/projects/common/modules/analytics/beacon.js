define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/ajax',
    'lodash/collections/map',
    'lodash/objects/isArray'
], function (
    _,
    config,
    ajax,
    map,
    isArray) {
    var canBeacon = !!navigator.sendBeacon;

    function buildCounts(keys) {
        return map(isArray(keys) ? keys : [keys], function (key) {
            return 'c=' + key;
        }).join('&');
    }

    // note, support is reasonably limited https://developer.mozilla.org/en-US/docs/Web/API/navigator.sendBeacon
    function beaconCounts(keys) {
        var url;
        if (canBeacon) {
            url = config.page.beaconUrl + '/accept-beacon?' + buildCounts(keys);
            return navigator.sendBeacon(url, '');
        }
    }

    return {
        fire: function (path) {
            var img = new Image();
            img.src = config.page.beaconUrl + path;

            return img;
        },
        postJson: function (path, jsonString, forceAjax) {
            var url = (config.page.beaconUrl || '').replace(/^\/\//, window.location.protocol + '//') + path;

            if (canBeacon && !forceAjax) {
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
            if (canBeacon) {
                return beaconCounts(keys);
            } else {
                var query = buildCounts(keys);
                return this.fire('/counts.gif?' + query);
            }
        },

        beaconCounts: beaconCounts
    };
});
