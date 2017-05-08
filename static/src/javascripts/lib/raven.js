// @flow

import raven from 'raven';
import config from 'lib/config';
import detect from 'lib/detect';

const { sentryPublicApiKey, sentryHost } = config.page;
const sentryUrl = `https://${sentryPublicApiKey}@${sentryHost}`;

let adblockBeingUsed = false;

const sentryOptions = {
    whitelistUrls: [
        // loaclhost will not log errors, but call `shouldSendCallback`
        /localhost/,
        /assets\.guim\.co\.uk/,
        /ophan\.co\.uk/,
    ],

    tags: {
        edition: config.page.edition,
        contentType: config.page.contentType,
        revisionNumber: config.page.revisionNumber,
    },

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
        const { isDev } = config.page;
        const isIgnored =
            typeof data.tags.ignored !== 'undefined' && data.tags.ignored;
        const { enableSentryReporting } = config.switches;
        const isInSample = Math.random() < 0.1;

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

detect.adblockInUse.then(adblockInUse => {
    adblockBeingUsed = adblockInUse;
});

export default raven.config(sentryUrl, sentryOptions).install();
