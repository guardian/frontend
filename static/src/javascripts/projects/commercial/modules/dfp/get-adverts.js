import dfpEnv from 'commercial/modules/dfp/dfp-env';
import getAdvertById from 'commercial/modules/dfp/get-advert-by-id';
export default getAdverts;

function getAdverts(withEmpty) {
    return Object.keys(dfpEnv.advertIds).reduce(function(advertsById, id) {
        var advert = getAdvertById.getAdvertById(id);
        // Do not return empty slots unless explicitely requested
        if (withEmpty || !advert.isEmpty) {
            advertsById[id] = advert;
        }
        return advertsById;
    }, {});
}
