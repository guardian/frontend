// @flow strict
import config from 'lib/config';
import { loadScript } from 'lib/load-script';

const errorHandler = (error: Error) => {
    // Looks like some plugins block ad-verification
    // Avoid barraging Sentry with errors from these pageviews
    console.log('Failed to load Confiant:', error);
};

export const init = (): Promise<void> => {
    const host = 'confiant-integrations.global.ssl.fastly.net';

    if (config.get('switches.confiantAdVerification')) {
        return loadScript(
            `//${host}/7oDgiTsq88US4rrBG0_Nxpafkrg/gpt_and_prebid/config.js`,
            { async: true }
        ).catch(errorHandler);
    }

    return Promise.resolve();
};
