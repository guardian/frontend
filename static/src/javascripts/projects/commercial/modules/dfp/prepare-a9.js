// @flow

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import once from 'lodash/once';
import a9 from 'commercial/modules/header-bidding/a9/a9';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { isGoogleProxy } from 'lib/detect';
import { shouldIncludeOnlyA9 } from 'commercial/modules/header-bidding/utils';

let moduleLoadResult = Promise.resolve();
if (!isGoogleProxy()) {
    moduleLoadResult = import('lib/a9-apstag.js');
}

const setupA9: () => Promise<void> = () =>
    moduleLoadResult.then(() => {
        if (
            shouldIncludeOnlyA9 ||
            (dfpEnv.hbImpl.a9 &&
                commercialFeatures.dfpAdvertising &&
                !commercialFeatures.adFree &&
                !config.get('page.hasPageSkin') &&
                !isGoogleProxy())
        ) {
            a9.initialise();
        }
        return Promise.resolve();
    });

export const setupA9Once: () => Promise<void> = once(setupA9);

export const init = (): Promise<void> => {
    setupA9Once();
    return Promise.resolve();
};

export const _ = {
    setupA9,
};
