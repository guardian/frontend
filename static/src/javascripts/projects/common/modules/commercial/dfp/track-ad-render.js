define([
    'common/modules/commercial/dfp/private/wait-for-advert'
], function (waitForAdvert) {
    return trackAdRender;
    function trackAdRender(id) {
        return waitForAdvert(id).then(function (_) { return _.whenRendered; });
    }
});
