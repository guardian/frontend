// @flow

import config from 'lib/config';
import { onConsentChange } from '@guardian/consent-management-platform';
import { shouldUseSourcepointCmp } from 'commercial/modules/cmp/sourcepoint';
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

const setupPrebid: () => Promise<void> = () => {
    let canRun: boolean = true;
    if (shouldUseSourcepointCmp()) {
        onConsentChange(state => {
            // Only TCFv2 mode can prevent running Prebid
            if (state.tcfv2) canRun = state.tcfv2.consents['1']; // Store and/or access information on a device
        });
    }
    if (canRun)
        moduleLoadResult.then(() => {
            if (
                dfpEnv.hbImpl.prebid &&
                commercialFeatures.dfpAdvertising &&
                !commercialFeatures.adFree &&
                !config.get('page.hasPageSkin') &&
                !isGoogleProxy() &&
                !shouldIncludeOnlyA9
            ) {
                getPageTargeting();
                prebid.initialise(window);
            }
        });
    return Promise.resolve();
};

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

export const init = (): Promise<void> => {
    setupPrebidOnce();
    return Promise.resolve();
};

export const _ = {
    setupPrebid,
};
