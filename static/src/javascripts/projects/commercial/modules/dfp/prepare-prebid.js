// @flow

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/once';
import prebid from 'commercial/modules/prebid/prebid';

const isGoogleProxy: () => boolean = () =>
    !!(
        navigator &&
        navigator.userAgent &&
        (navigator.userAgent.indexOf('Google Web Preview') > -1 ||
            navigator.userAgent.indexOf('googleweblight') > -1)
    );

let moduleLoadResult = Promise.resolve();

if (!isGoogleProxy()) {
    moduleLoadResult = import(/* webpackChunkName: "Prebid.js" */ 'prebid.js/build/dist/prebid');
}

const setupPrebid: () => Promise<void> = () =>
    moduleLoadResult.then(() => {
        if (
            dfpEnv.externalDemand === 'prebid' &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy()
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
    isGoogleProxy,
    setupPrebid,
};
