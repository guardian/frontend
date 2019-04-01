// @flow strict

import { loadScript } from 'lib/load-script';
import { commercialAdVerification } from 'common/modules/experiments/tests/commercial-ad-verification.js';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

const errorHandler = (error: Error) => {
    // Looks like some plugins block ad-verification
    // Avoid barraging Sentry with errors from these pageviews
    console.log('Failed to load Confiant:', error);
};

export const init = (start: () => void): Promise<void> => {
    const host = 'clarium.global.ssl.fastly.net';
    const activationString =
        '|||MjE5NzUwMDg3,|||MjQxMTU4MzI3,|||MjM4NzY0MTY0Mg==,|||MjM4NzY0MTY0NQ==,|||MjM4NzY0MTY0OA==,|||MjM4NzY0MTY1MQ==,|||MjM4NzY0MTY1NA==,|||MjM4NzY0MTY1Nw==,|||MjM4NzY0MTY2MA==,|||MjM4NzY0MTY2Mw==,|||MjM4NzY0MTY2Ng==,|||MjM4NzY0MTY2OQ==,|||MjM4NzY0MTY3Mg==,|||MjM4NzY0MTY3NQ==,|||MjM4NzY0MTY3OA==,|||MjM4NzY0MTgwMQ==,|||MjM4NzY0MTgwNA==,|||MjM4NzY0MTgwNw==,|||MjM4NzY5MjUzMw==,|||MjM4NzY5MjUzNg==,|||MjM4NzY5NTkwOA==,|||MjM4NzY5NTkxMQ==,|||MjM4NzY5NTkxNA==,|||MjM4NzY5NTkxNw==,|||MjM4NzY5NjA0MA==,|||MjM4NzY5NjA0Mw==,|||MjM4NzY5NjA0Ng==,|||MjM4NzY5NjA0OQ==,|||MjE4NTM0MTI3,|||MzcxMTIwNzI3,|||MjQ4NTY3NTgyNw==,|||MjQ4NTcxNTQyOA==,|||MjQ4NDc3NTg5NQ==,|||MjQ4NTE4MjY3OQ==,|||MjQ4NTM0NTY3OQ==,|||MjQ4NTcyMjY3Mw==,|||MjQ4NTcyMjY3Ng==,|||MjQ4NTc5MTAzNw==,|||MjQ4NTcyMjY3OQ==,|||MjQ4NTM0NTgwMg==,|||MjQ4NTcyMjY4Mg==,|||MjQ4NTQxMTgzOA==,|||MjQ4NTc5MTA0MA==,|||MjQ4NzQ2NTAxMw==,|||MjQ4NTQ3NDA2MQ==,|||MjQ4NTQ3NDA2Nw==,|||MjQ4NTQ3NDA2NA==,|||MjQ4NTQ3NDA3MA==,|||MjQ4NTg2MDE0NQ==,|||MjQ4NTQ3NDA3Mw==,|||MjQ4ODAxNjg2OA==,|||MjQ4NzQ2NDU2Ng==,|||MjQ4NzQ2NTAwNA==,|||MjQ4NTQ3NDA3Ng==,|||MjQ4NzQ2NTAxMA==,|||MjQ4ODA1NDk4Mw==,|||MjQ1ODAxODQ0OQ==,|||MzUwMDYwNzI3,|||MzUwNjE1ODQ3';

    start();

    if (isInVariantSynchronous(commercialAdVerification, 'variant')) {
        // vivify the _clrm object

        /* eslint-disable no-underscore-dangle */
        window._clrm = window._clrm || {};
        window._clrm.gpt = {
            propertyId: '7oDgiTsq88US4rrBG0_Nxpafkrg',
            confiantCdn: host,
            mapping:
                'W3siaSI6MiwidCI6Int7b319Ont7d319eHt7aH19IiwicCI6MCwiRCI6MSwiciI6W119XQ==',
            activation: activationString,
            callback(...args) {
                console.log('w00t one more bad ad nixed.', args);
            },
        };
        /* eslint-enable no-underscore-dangle */

        return loadScript(`//${host}/gpt/a/wrap.js`, { async: true }).catch(
            errorHandler
        );
    }
    return Promise.resolve();
};
