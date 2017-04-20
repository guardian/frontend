define([
    'lib/config',
    'lib/fetch-json',
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
        postJson: function (path, jsonString) {
            var url = (config.page.beaconUrl || '').replace(/^\/\//, window.location.protocol + '//') + path;

            fetchJSON(url, {
                method: 'post',
                header: {
                    'Content-Type': 'application/json',
                },
                body: jsonString,
                mode: 'cors',
            });
        },
    };
});
