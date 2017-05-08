define([
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/get-advert-by-id'
], function (dfpEnv, getAdvertById) {
    return getAdverts;

    function getAdverts(withEmpty) {
        return Object.keys(dfpEnv.advertIds).reduce(function (advertsById, id) {
            var advert = getAdvertById.getAdvertById(id);
            // Do not return empty slots unless explicitely requested
            if (withEmpty || !advert.isEmpty) {
                advertsById[id] = advert;
            }
            return advertsById;
        }, {});
    }
});
