
import { dfpEnv } from "commercial/modules/dfp/dfp-env";
import { Advert } from "commercial/modules/dfp/Advert";

const getAdvertById = (id: string): Advert | null | undefined => id in dfpEnv.advertIds ? dfpEnv.adverts[dfpEnv.advertIds[id]] : null;

export { getAdvertById };