// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import prebid from 'commercial/modules/prebid/prebid';

const isGoogleWebPreview: () => boolean = () =>
    !!(
        navigator &&
        navigator.userAgent &&
        navigator.userAgent.indexOf('Google Web Preview') > -1
    );

if (!isGoogleWebPreview()) {
    import(/* webpackMode: "eager" */ 'prebid.js/build/dist/prebid');
}

const setupPrebid: () => Promise<void> = () => {
    if (
        dfpEnv.externalDemand === 'prebid' &&
        commercialFeatures.dfpAdvertising &&
        !commercialFeatures.adFree &&
        !isGoogleWebPreview()
    ) {
        buildPageTargeting();
        prebid.initialise(window);
    }
    return Promise.resolve();
};

export const setupPrebidOnce: () => Promise<void> = once(setupPrebid);

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();
    setupPrebidOnce().then(stop);
    return Promise.resolve();
};

export const _ = {
    isGoogleWebPreview,
    setupPrebid,
};
