// @flow

import raven from 'raven-js';
import config from 'lib/config';
import { adblockInUse } from 'lib/detect';

const { sentryPublicApiKey, sentryHost } = config.get('page', {});
const sentryUrl = `https://${sentryPublicApiKey}@${sentryHost}`;

let adblockBeingUsed = false;

const sentryOptions = {
    whitelistUrls: [
        // localhost will not log errors, but call `shouldSendCallback`
        /localhost/,
        /assets\.guim\.co\.uk/,
        /ophan\.co\.uk/,
    ],

    tags: {
        edition: config.get('page.edition'),
        contentType: config.get('page.contentType'),
        revisionNumber: config.get('page.revisionNumber'),
    },

    ignoreErrors: [
        "Can't execute code from a freed script",
        /There is no space left matching rules from/gi,
        'Top comments failed to load:',
        'Comments failed to load:',
        /InvalidStateError/gi,
        /Fetch error:/gi,
        'Network request failed',
        'This video is no longer available.',
        'UnknownError',

        // weatherapi/city.json frequently 404s and lib/fetch-json throws an error
        'Fetch error while requesting https://api.nextgen.guardianapps.co.uk/weatherapi/city.json:',
    ],

    dataCallback(data: Object): Object {
        const { culprit = false } = data;
        const resp = data;
        const culpritMatches = /j.ophan.co.uk/.test(data.culprit);

        if (culprit) {
            resp.culprit = culprit.replace(/\/[a-z\d]{32}(\/[^/]+)$/, '$1');
        }

        resp.tags.origin = culpritMatches ? 'ophan' : 'app';

        return resp;
    },

    shouldSendCallback(data: Object): boolean {
        const { isDev } = config.get('page');
        const isIgnored =
            typeof data.tags.ignored !== 'undefined' && data.tags.ignored;
        const { enableSentryReporting } = config.get('switches');
        const isInSample = Math.random() < 0.025; // 2.5%

        if (isDev && !isIgnored) {
            // Some environments don't support or don't always expose the console Object
            if (window.console && window.console.warn) {
                window.console.warn('Raven captured error.', data);
            }
        }

        return (
            enableSentryReporting &&
            isInSample &&
            !isIgnored &&
            !adblockBeingUsed &&
            !isDev
        );
    },
};

adblockInUse.then(isUse => {
    adblockBeingUsed = isUse;
});

export default raven.config(sentryUrl, sentryOptions).install();
