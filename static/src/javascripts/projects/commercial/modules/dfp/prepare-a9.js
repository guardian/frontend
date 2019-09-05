// @flow

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import once from 'lodash/once';
import a9 from 'commercial/modules/prebid/a9';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { isGoogleProxy } from 'lib/detect';
import { isInUsRegion } from 'commercial/modules/prebid/utils';

let moduleLoadResult = Promise.resolve();
if (!isGoogleProxy()) {
    moduleLoadResult = import('lib/apstag.js');
}

const setupA9: () => Promise<void> = () =>
    moduleLoadResult.then(() => {
        if (
            isInUsRegion() &&
            (dfpEnv.externalDemand === 'a9' ||
                dfpEnv.externalDemand === 'all') &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy()
        ) {
            a9.initialise();
        }
        return Promise.resolve();
    });

export const setupA9Once: () => Promise<void> = once(setupA9);

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();
    setupA9Once().then(stop);
    return Promise.resolve();
};

export const _ = {
    setupA9,
};
