// @flow
import { loadScript } from 'lib/load-script';
import config from 'lib/config';

// Fetches Lotame Data for the Ozone project
// and stores in in window.OzoneLotameData
const init = (start: () => void): Promise<void> => {
    start();
    const edition = config.get('page.edition');

    // This will inject OzoneLotameData in the window object
    // to be used by Ozone bid adapters.
    if (edition === 'UK' || edition === 'INT') {
        return loadScript(
            `//ad.crwdcntrl.net/5/c=13271/pe=y/var=OzoneLotameData`,
            {
                async: true,
            }
        );
    }
    return Promise.resolve();
};

export { init };
