// @flow

import dfpEnv from 'commercial/modules/dfp/dfp-env';

const getCreativeIDs = (): Array<string> => dfpEnv.creativeIDs;

export default getCreativeIDs;
