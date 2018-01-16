// @flow
import { dfpEnv } from 'commercial-legacy/modules/dfp/dfp-env';
import { Advert } from 'commercial-legacy/modules/dfp/Advert';

const getAdvertById = (id: string): ?Advert =>
    id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
