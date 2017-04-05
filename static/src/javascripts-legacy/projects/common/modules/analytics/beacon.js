define([
    'lib/config',
    'lib/fetch-json'
], function (
    config,
    fetchJSON
) {
    return {
        fire: function (path) {
            var img = new Image();
            img.src = config.page.beaconUrl + path;

            return img;
        },
        postJson: function (path, body) {
            var url = (config.page.beaconUrl || '').replace(/^\/\//, window.location.protocol + '//') + path;

            fetchJSON(url, {
                body: body,
                contentType: 'application/json',
                method: 'post',
                mode: 'cors',
                type: 'json',
            });
        }
    };
});
