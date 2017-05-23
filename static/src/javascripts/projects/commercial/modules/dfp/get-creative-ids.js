// @flow

import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

const getCreativeIDs = (): Array<number> => dfpEnv.creativeIDs;

export default getCreativeIDs;
