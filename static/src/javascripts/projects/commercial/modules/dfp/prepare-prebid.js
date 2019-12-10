// @flow

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import { isGoogleProxy } from 'lib/detect';
import { shouldIncludeOnlyA9 } from 'commercial/modules/header-bidding/utils';

let moduleLoadResult = Promise.resolve();

if (!isGoogleProxy()) {
    moduleLoadResult = import(/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid');
}

const setupPrebid: () => Promise<void> = () =>
    moduleLoadResult.then(() => {
        if (
            (dfpEnv.externalDemand === 'prebid' ||
                dfpEnv.externalDemand === 'all') &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy() &&
            !shouldIncludeOnlyA9
        ) {
            getPageTargeting();
            prebid.initialise(window);
        }
        return Promise.resolve();
    });

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

export const init = (): Promise<void> => {
    setupPrebidOnce();
    return Promise.resolve();
};

export const _ = {
    setupPrebid,
};
