import type { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

const getAdvertById = (id: string): Advert | null | undefined =>
    id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
