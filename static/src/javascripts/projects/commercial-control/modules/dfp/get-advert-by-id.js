// @flow
import { dfpEnv } from 'commercial-control/modules/dfp/dfp-env';
import { Advert } from 'commercial-control/modules/dfp/Advert';

const getAdvertById = (id: string): ?Advert =>
    id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
