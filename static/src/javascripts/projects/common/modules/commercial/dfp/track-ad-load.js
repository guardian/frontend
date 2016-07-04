define([
    'common/modules/commercial/dfp/dfp-obj',
    'common/modules/commercial/dfp/private/wait-for-advert'
], function (dfp, waitForAdvert) {
    dfp.trackAdLoad = trackAdLoad;
    return trackAdLoad;
    function trackAdLoad(id) {
        return waitForAdvert(id).then(function (_) { return _.whenLoaded; });
    }
});
