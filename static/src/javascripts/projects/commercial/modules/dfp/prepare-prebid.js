// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import prebid from 'commercial/modules/prebid/prebid';
import config from 'lib/config';

export const setupPrebid: () => Promise<void> = once(() => {
    if (
        dfpEnv.externalDemand === 'prebid' &&
        commercialFeatures.dfpAdvertising &&
        !commercialFeatures.adFree
    ) {
        buildPageTargeting();
        prebid.initialise(config, window);
    }
    return Promise.resolve();
});

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();
    setupPrebid().then(stop);
    return Promise.resolve();
};
