// @flow
import config from 'lib/config';
import fetch from 'lib/fetch';
import { CMP_GLOBAL_NAME } from 'commercial/modules/cmp/cmp-env';
import { getRandomIntInclusive } from 'commercial/modules/prebid/utils';

export const trackConsent = (): void => {
    // gather analytics from 0.1% (1 in 1000) of page views
    const inSample = getRandomIntInclusive(1, 1000) === 1;
    if (config.switches.pageViewAnalytics && (inSample || config.page.isDev)) {
        const pageViewId = config.get('ophan.pageViewId');
        const cmp = window[CMP_GLOBAL_NAME];
        if (pageViewId && cmp) {
            cmp('getConsentData', [], result => {
                const url = `${config.get(
                    'page.ajaxUrl',
                    ''
                )}/commercial/api/pv`;
                const payload = {};
                payload.pv = pageViewId;
                payload.cs = result.consentData;
                fetch(url, {
                    method: 'post',
                    body: JSON.stringify(payload),
                    mode: 'cors',
                });
            });
        }
    }
};
