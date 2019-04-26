// @flow strict

import { loadScript } from 'lib/load-script';
import { commercialAdVerificationQA } from 'common/modules/experiments/tests/commercial-ad-verification-qa.js';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

const errorHandler = (error: Error) => {
    // Looks like some plugins block ad-verification
    // Avoid barraging Sentry with errors from these pageviews
    console.log('Failed to load Confiant:', error);
};

export const init = (start: () => void): Promise<void> => {
    const host = 'confiant-integrations.global.ssl.fastly.net';

    start();

    if (isInVariantSynchronous(commercialAdVerificationQA, 'variant')) {
        return loadScript(
            `//${host}/7oDgiTsq88US4rrBG0_Nxpafkrg/gpt_and_prebid/config.js`,
            { async: true }
        ).catch(errorHandler);
    }
    return Promise.resolve();
};
