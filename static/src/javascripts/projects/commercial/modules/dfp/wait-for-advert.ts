import type { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import memoize from 'lodash/memoize';

export const waitForAdvert = memoize(
    (id: string): Promise<Advert> =>
        new Promise((resolve) => {
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
