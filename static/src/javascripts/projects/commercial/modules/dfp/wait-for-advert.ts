import { memoize } from 'lodash-es';
import type { Advert } from './Advert';
import { getAdvertById } from './get-advert-by-id';

export const waitForAdvert = memoize<(id: string) => Promise<Advert>>(
	(id) =>
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
		}),
);
