// @flow

import { getUrlVars } from 'lib/url';
import { removeCookie, addCookie } from 'lib/cookies';


const init = (): Promise<void> => {
    const queryParams = getUrlVars();

    if (queryParams.adtest === 'clear') {
        removeCookie('adtest');
    } else if (queryParams.adtest) {
        addCookie('adtest', encodeURIComponent(queryParams.adtest), 10);
    }
    return Promise.resolve();
};

export { init };
