// @flow strict

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import once from 'lodash/once';
import a9 from 'commercial/modules/header-bidding/a9/a9';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { isGoogleProxy } from 'lib/detect';
import { shouldIncludeOnlyA9 } from 'commercial/modules/header-bidding/utils';
import { isInUsa } from 'common/modules/commercial/geo-utils';

const setupA9: () => Promise<void> = () => {
    // There are two articles that InfoSec would like to avoid loading scripts on
    if (commercialFeatures.isSecureContact) {
        return Promise.resolve();
    }

    let moduleLoadResult = Promise.resolve();
    if (
        shouldIncludeOnlyA9 ||
        (dfpEnv.hbImpl.a9 &&
            isInUsa() &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy())
    ) {
        moduleLoadResult = import('lib/a9-apstag.js').then(() => {
            a9.initialise();

            return Promise.resolve();
        });
    }

    return moduleLoadResult;
};

const setupA9Once: () => Promise<void> = once(setupA9);

export const init = (): Promise<void> => {
    setupA9Once();
    return Promise.resolve();
};

export const _ = {
    setupA9,
};
