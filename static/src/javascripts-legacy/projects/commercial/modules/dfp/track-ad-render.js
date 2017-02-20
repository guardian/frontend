define([
    'commercial/modules/dfp/wait-for-advert'
], function (waitForAdvert) {
    return trackAdRender;
    function trackAdRender(id) {
        return waitForAdvert(id).then(function (_) { return _.whenRendered; });
    }
});
