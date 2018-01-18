// @flow

import { dfpEnv } from 'commercial-control/modules/dfp/dfp-env';

const getCreativeIDs = (): Array<number> => dfpEnv.creativeIDs;

export default getCreativeIDs;
