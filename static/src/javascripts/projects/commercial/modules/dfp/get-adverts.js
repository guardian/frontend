import { dfpEnv } from './dfp-env';
import { getAdvertById } from './get-advert-by-id';

export const getAdverts = (withEmpty) =>
    Object.keys(dfpEnv.advertIds).reduce((advertsById, id) => {
        const advert = getAdvertById(id);
        // Do not return empty slots unless explicitely requested
        if (withEmpty || (advert && !advert.isEmpty)) {
            advertsById[id] = advert;
        }
        return advertsById;
    }, {});
