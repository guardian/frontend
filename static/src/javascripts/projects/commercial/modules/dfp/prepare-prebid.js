import {
    getConsentFor,
    onConsentChange,
} from '@guardian/consent-management-platform';
import once from 'lodash/once';
import config from '../../../../lib/config';
import { isGoogleProxy } from '../../../../lib/detect';
import { getPageTargeting } from '../../../common/modules/commercial/build-page-targeting';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import prebid from '../header-bidding/prebid/prebid';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

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
