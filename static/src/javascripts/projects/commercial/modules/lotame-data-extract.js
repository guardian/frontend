// @flow
import { loadScript } from 'lib/load-script';
import config from 'lib/config';

// Fetches Lotame Data for the Ozone project
// and stores in in window.OzoneLotameData
const init = (start: () => void): Promise<void> => {
    start();
    const isLotameOn = config.get('switches.lotame');
    const edition = config.get('page.edition');

    if (!isLotameOn) {
        return Promise.resolve();
    }

    const promiseArray = [
        // This will inject OzoneLotameData in the window object
        // to be used by Ozone bid adapters.
        ...(edition === 'UK' || edition === 'INT'
            ? [
                  loadScript(
                      `//ad.crwdcntrl.net/5/c=13271/pe=y/var=OzoneLotameData`,
                      { async: true }
                  ),
              ]
            : []),
        new Promise((resolve, reject) => {
            if ('LOTCC' in window && 'bcp' in window.LOTCC) {
                resolve(window.LOTCC.bcp());
            } else {
                reject(Error('No LOTCC in window'));
            }
        }),
    ];
    return promiseArray
        .reduce((current, next) => current.then(() => next), Promise.resolve())
        .then(
            () => {},
            error => {
                // Lotame fails to load 0.04% of the time. We dont
                // want to pollute our sentry
                console.log('Failed to extract lotame data:', error);
            }
        );
};

export { init };
