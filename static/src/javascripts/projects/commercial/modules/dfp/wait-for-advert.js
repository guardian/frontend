import memoize from 'lodash/memoize';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

export const waitForAdvert = memoize(
    (id) =>
        new Promise(resolve => {
            const checkAdvert = () => {
                const advert = getAdvertById(id);
                if (!advert) {
                    window.setTimeout(checkAdvert, 200);
                } else {
                    resolve(advert);
                }
            };
            checkAdvert();
        })
);
