define([
    'common/utils/config',
    'common/utils/ajax'
], function (
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
            var url = (config.page.beaconUrl || '').replace(/^\/\//, window.location.protocol + '//') + path;

            ajax({
                url: url,
                type: 'json',
                method: 'post',
                contentType: 'application/json',
                data: jsonString,
                crossOrigin: true
            });
        }
    };
});
