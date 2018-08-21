// @flow
import { loadScript } from 'lib/load-script';

// Fetches Lotame Data for the Ozone project
// and stores in in window.OzoneLotameData
const init = (start: () => void): Promise<void> => {
    start();
    // This will inject OzoneLotameData in the window object
    // to be used by Ozone bid adapters.
    return loadScript(`//ad.crwdcntrl.net/5/c=13271/pe=y/var=OzoneLotameData`, {
        async: true,
    });
};

export { init };
