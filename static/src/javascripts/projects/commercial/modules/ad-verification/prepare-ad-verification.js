// @flow

import { loadScript } from 'lib/load-script';
import { commercialAdVerification } from 'common/modules/experiments/tests/commercial-ad-verification.js';
import { isInVariant } from 'common/modules/experiments/ab-tests';

export const init = (start: () => void): Promise<void> => {
    const host = 'clarium.global.ssl.fastly.net';

    start();

    if (isInVariant(commercialAdVerification, 'variant')) {
        // vivify the _clrm object

        /* eslint-disable no-underscore-dangle */
        window._clrm = window._clrm || {};
        window._clrm.gpt = {
            propertyId: 'qE4aQtYj644UghGyTZsDnq5Qh_A',
            confiantCdn: host,
            mapping:
                'W3siaSI6MiwidCI6Int7b319Ont7d319eHt7aH19IiwicCI6MCwiRCI6MSwiciI6W119XQ==',
            activation:
                '|||MjIxNzg5NDY2OQ==,|||MjE4NTM0MTI3,|||MjE5NzUwMDg3,|||MjM0ODc4NzI3,|||MzcxNjYwOTY3',
            callback(...args) {
                console.log('w00t one more bad ad nixed.', args);
            },
        };
        /* eslint-enable no-underscore-dangle */

        // and load the script tag
        return loadScript(`//${host}/gpt/a/wrap.js`, { async: true });
    }
    // Do nothing.
    return Promise.resolve();
};
