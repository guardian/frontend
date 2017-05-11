// @flow
import dfpEnv from 'commercial/modules/dfp/dfp-env';

const getAdvertById = (id: string): ?Object =>
    id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
