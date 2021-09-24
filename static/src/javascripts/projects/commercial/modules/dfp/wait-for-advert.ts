import { memoize } from 'lodash-es';
import type { Advert } from './Advert';
import { getAdvertById } from './get-advert-by-id';

const CHECK_ADVERT_TIMEOUT_MS = 200;

export const waitForAdvert = memoize<(id: string) => Promise<Advert>>(
	(id) =>
		new Promise((resolve) => {
			const checkAdvert = () => {
				const advert = getAdvertById(id);
				if (!advert) {
					window.setTimeout(checkAdvert, CHECK_ADVERT_TIMEOUT_MS);
				} else {
					resolve(advert);
				}
			};
			checkAdvert();
		}),
);
