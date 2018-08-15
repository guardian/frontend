// @flow
import memoize from 'lodash/functions/memoize';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

export const waitForAdvert = memoize(
    id =>
        new Promise(resolve => {
            const checkAdvert = () => {
                console.log(`Looping and waiting for ${id}`);
                const advert = getAdvertById(id);
                if (!advert) {
                    window.setTimeout(checkAdvert, 200);
                } else {
                    console.log(`Resolving waitForAdvert for ${id}`);
                    console.dir(advert);
                    resolve(advert);
                }
            };
            checkAdvert();
        })
);
