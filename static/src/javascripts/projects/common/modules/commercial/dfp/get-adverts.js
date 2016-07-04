define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/get-advert-by-id',
    'common/modules/commercial/dfp/dfp-obj'
], function (dfpEnv, getAdvertById, dfp) {
    dfp.getAdverts = getAdverts;
    return getAdverts;

    function getAdverts(withEmpty) {
        return Object.keys(dfpEnv.advertIds).reduce(function (advertsById, id) {
            var advert = getAdvertById(id);
            // Do not return empty slots unless explicitely requested
            if (withEmpty || !advert.isEmpty) {
                advertsById[id] = advert;
            }
            return advertsById;
        }, {});
    }
});
