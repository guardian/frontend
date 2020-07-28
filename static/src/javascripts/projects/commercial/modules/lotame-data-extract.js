// @flow strict
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { loadScript } from 'lib/load-script';
import config from 'lib/config';
import { shouldUseSourcepointCmp } from 'commercial/modules/cmp/sourcepoint';
import { onConsentChange } from '@guardian/consent-management-platform';

const SOURCEPOINT_ID: string = '5ed6aeb1b8e05c241a63c71f';
const errorHandler = (error: Error) => {
    // Lotame fails to load 0.04% of the time. We dont
    // want to pollute our sentry
    console.log('Failed to extract lotame data:', error);
};

const shouldLoadLotame = (): boolean => {
    const edition = config.get('page.edition');

    return (
        config.get('switches.lotame', false) &&
        (edition === 'UK' || edition === 'INT')
    );
};
let initialised: boolean = false;

// Fetches Lotame Data for the Ozone project
const loadLotamePromise = () => loadScript('//ad.crwdcntrl.net/5/c=13271/pe=y/var=OzoneLotameData')
        .then(() => {
            if (config.get('isDotcomRendering', false)) {
                // We do not need the LOTCC initialization for dotcom-rendering Ad Free
                return Promise.resolve();
            }
            if ('LOTCC' in window && 'bcp' in window.LOTCC) {
                Promise.resolve(window.LOTCC.bcp());
            } else {
                return Promise.reject(Error('No LOTCC in window'));
            }
        })
        .catch(errorHandler)

// and stores in in window.OzoneLotameData
const init = (): Promise<void> => {
    if (!shouldLoadLotame || commercialFeatures.isSecureContact) {
        return Promise.resolve();
    }
    if (shouldUseSourcepointCmp()) {
        onConsentChange(state => {
            let canRun: boolean = false;
            if (state.tcfv2) {
                // TCFv2 mode
                if (
                    typeof state.tcfv2.vendorConsents[SOURCEPOINT_ID] !== 'undefined'
                ) {
                    canRun = state.tcfv2.vendorConsents[SOURCEPOINT_ID];
                } else {
                    canRun = Object.values(state.tcfv2.consents).every(Boolean);
                }
            }

            if (!initialised && canRun) {
                initialised = true;
                return loadLotamePromise();
            }
            return Promise.resolve();
        });
    } else {
        return loadLotamePromise();
    }
    return Promise.resolve();
};

export { init };
