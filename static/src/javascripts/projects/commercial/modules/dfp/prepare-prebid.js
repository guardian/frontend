// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import { prebid } from 'commercial/modules/prebid/prebid';

const isGoogleWebPreview: () => boolean = () => {
    try {
        return navigator.userAgent.indexOf('Google Web Preview') > -1;
    } catch (exception) {
        return false;
    }
};

if (!isGoogleWebPreview()) {
    require('prebid.js/build/dist/prebid'); // eslint-disable-line global-require
}

export const setupPrebid: () => Promise<void> = once(() => {
    if (
        dfpEnv.externalDemand === 'prebid' &&
        commercialFeatures.dfpAdvertising &&
        !commercialFeatures.adFree &&
        !isGoogleWebPreview()
    ) {
        buildPageTargeting();
        prebid.initialise();
    }
    return Promise.resolve();
});

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();
    setupPrebid().then(stop);
    return Promise.resolve();
};
