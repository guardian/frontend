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
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { googletagPrebidEnforcement } from 'common/modules/experiments/tests/tcfv2-googletag-prebid-enforcement';

const SOURCEPOINT_ID: string = '5f22bfd82a6b6c1afd1181a9';

const loadPrebid: () => void = () => {
        if (
            dfpEnv.hbImpl.prebid &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy() &&
            !shouldIncludeOnlyA9
        ) {
            import(/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid').then(() => {
                getPageTargeting();
                prebid.initialise(window);
            });
        }
}

const setupPrebid: () => Promise<void> = () => {
    let canRun: boolean = true;
    const isInTcfv2EnforcementVariant = isInVariantSynchronous(googletagPrebidEnforcement, 'variant')
    if (shouldUseSourcepointCmp()) {
        onConsentChange(state => {
            // Only TCFv2 mode can prevent running Prebid
            if (state.tcfv2) canRun = state.tcfv2.vendorConsents[SOURCEPOINT_ID];
            if (canRun && isInTcfv2EnforcementVariant) {
                loadPrebid();
                return Promise.resolve();
            }
        });
    }
    if (canRun && !isInTcfv2EnforcementVariant) {
        loadPrebid();
    }

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
