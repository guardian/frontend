import { dfpEnv } from './dfp-env';

const getAdvertById = (id) =>
    id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };
