import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';

const getAdvertById = (id: string): Advert | null =>
	id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
