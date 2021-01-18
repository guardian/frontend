import config from 'lib/config';
import {
    onConsentChange,
    getConsentFor,
} from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import { isGoogleProxy } from 'lib/detect';
import { shouldIncludeOnlyA9 } from 'commercial/modules/header-bidding/utils';

const loadPrebid = () => {
    if (
        dfpEnv.hbImpl.prebid &&
        commercialFeatures.dfpAdvertising &&
        !commercialFeatures.adFree &&
        !config.get('page.hasPageSkin') &&
        !isGoogleProxy() &&
        !shouldIncludeOnlyA9
    ) {
        import(/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid').then(
            () => {
                getPageTargeting();
                prebid.initialise(window);
            }
        );
    }
};

const setupPrebid = () => {
    onConsentChange(state => {
        const canRun = getConsentFor('prebid', state);
        if (canRun) {
            loadPrebid();
        }
    });

    return Promise.resolve();
};

export const setupPrebidOnce = once(setupPrebid);

export const init = () => {
    setupPrebidOnce();
    return Promise.resolve();
};

export const _ = {
    setupPrebid,
};
