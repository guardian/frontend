// @flow strict
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { loadScript } from 'lib/load-script';
import config from 'lib/config';

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

// Fetches Lotame Data for the Ozone project
// and stores in in window.OzoneLotameData
const init = (): Promise<void> => {
    if (!shouldLoadLotame || commercialFeatures.shouldBlockAnalytics) {
        return Promise.resolve();
    }
    return loadScript('//ad.crwdcntrl.net/5/c=13271/pe=y/var=OzoneLotameData')
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
        .catch(errorHandler);
};

export { init };
