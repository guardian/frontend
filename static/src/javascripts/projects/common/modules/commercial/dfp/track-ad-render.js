define([
    'common/modules/commercial/dfp/dfp-obj',
    'common/modules/commercial/dfp/private/wait-for-advert'
], function (dfp, waitForAdvert) {
    dfp.trackAdRender = trackAdRender;
    return trackAdRender;
    function trackAdRender(id) {
        return waitForAdvert(id).then(function (_) { return _.whenRendered; });
    }
});
