define(['common/utils/config'], function (config) {

    return {
        fire: function (path) {
            var img = new Image();
            img.src = config.page.beaconUrl + path;
        }
    };
});
