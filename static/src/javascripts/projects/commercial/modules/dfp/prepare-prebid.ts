import {
    getConsentFor,
    onConsentChange,
} from '@guardian/consent-management-platform';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import { shouldIncludeOnlyA9 } from 'commercial/modules/header-bidding/utils';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import config from 'lib/config';
import { isGoogleProxy } from 'lib/detect';
import once from 'lodash/once';

const loadPrebid: () => void = () => {
    if (
        dfpEnv.hbImpl.prebid &&
        commercialFeatures.dfpAdvertising &&
        !commercialFeatures.adFree &&
        !config.get('page.hasPageSkin') &&
        !isGoogleProxy() &&
        !shouldIncludeOnlyA9
    ) {
        import(
            /* webpackChunkName: "Prebid.js" */
            'prebid.js/build/dist/prebid'
        ).then(() => {
            getPageTargeting();
            prebid.initialise(window);
        });
    }
};

const setupPrebid: () => Promise<void> = () => {
    onConsentChange((state) => {
        const canRun: boolean = getConsentFor('prebid', state);
        if (canRun) {
            loadPrebid();
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
