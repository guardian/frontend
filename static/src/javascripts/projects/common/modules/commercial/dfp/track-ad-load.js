define([
    'commercial/modules/dfp/wait-for-advert'
], function (waitForAdvert) {
    return trackAdLoad;
    function trackAdLoad(id) {
        return waitForAdvert(id).then(function (_) { return _.whenLoaded; });
    }
});
