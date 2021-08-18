import {
    getConsentFor,
    onConsentChange,
} from '@guardian/consent-management-platform';
import once from 'lodash/once';
import config from '../../../../lib/config';
import { isGoogleProxy } from '../../../../lib/detect';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import a9 from '../header-bidding/a9/a9';
import { shouldIncludeOnlyA9 } from '../header-bidding/utils';
import { dfpEnv } from './dfp-env';

const setupA9 = () => {
    // There are two articles that InfoSec would like to avoid loading scripts on
    if (commercialFeatures.isSecureContact) {
        return Promise.resolve();
    }

    let moduleLoadResult = Promise.resolve();
    if (
        shouldIncludeOnlyA9 ||
        (dfpEnv.hbImpl.a9 &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy())
    ) {
        moduleLoadResult = import(/* webpackChunkName: "a9" */ '../../../../lib/a9-apstag.js').then(() => {
            a9.initialise();

            return Promise.resolve();
        });
    }

    return moduleLoadResult;
};

const setupA9Once = once(setupA9);

export const init = () => {
    onConsentChange(state => {
        if (getConsentFor('a9', state)) {
            setupA9Once();
        }
    });

    return Promise.resolve();
};

export const _ = {
    setupA9,
};
