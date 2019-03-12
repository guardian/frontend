// @flow
import config from 'lib/config';
import fetch from 'lib/fetch';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';
import { CMP_GLOBAL_NAME } from 'commercial/modules/cmp/cmp-env';
import type { ConsentDataResponse } from 'commercial/modules/cmp/types';
import { getRandomIntInclusive } from 'commercial/modules/prebid/utils';

declare type ConsentPayload = {
    pv: string, // page view ID
    cs: ?string, // consent string
    cc: ?boolean, // consent cookie value
};

const shouldTrack = (): boolean => {
    // gather analytics from 1% (1 in 100) of page views
    const inSample = getRandomIntInclusive(1, 100) === 1;
    return (
        config.get('switches.commercialPageViewAnalytics') &&
        (inSample || config.get('page.isDev'))
    );
};

const buildPayload = (
    consent: ConsentDataResponse,
    pageViewId: string
): ConsentPayload => ({
    pv: pageViewId,
    cs: consent.consentData,
    cc: getAdConsentState(thirdPartyTrackingAdConsent),
});

const postConsent = (payload: ConsentPayload): void => {
    const url = `${config.get('page.ajaxUrl', '')}/commercial/api/pv`;
    fetch(url, {
        method: 'post',
        body: JSON.stringify(payload),
        mode: 'cors',
    });
};

export const trackConsent = (): void => {
    if (shouldTrack()) {
        const pageViewId = config.get('ophan.pageViewId');
        const cmp = window[CMP_GLOBAL_NAME];
        if (pageViewId && cmp) {
            cmp('getConsentData', [], result => {
                postConsent(buildPayload(result, pageViewId));
            });
        }
    }
};
