import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

export const getCreativeIDs = (): number[] => dfpEnv.creativeIDs;
