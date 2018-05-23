// @flow
import ophan from 'ophan/ng';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';
import {
    allAdConsents,
    getAdConsentState,
} from 'common/modules/commercial/ad-prefs.lib';
import userPrefs from 'common/modules/user-prefs';

const lifeTimeViewsKey: string = 'first-pv-consent.lifetime-views';

const getAlertViewCount = (): number =>
    parseInt(userPrefs.get(lifeTimeViewsKey), 10);

const upAlertViewCount = (): void => {
    userPrefs.set(lifeTimeViewsKey, (userPrefs.get(lifeTimeViewsKey) || 0) + 1);
};

const onConsentSet = (consent: AdConsent, status: ?boolean): void => {
    ophan.record({
        component: `ad-prefs`,
        value: `set : ${String(status)} : ${consent.cookie.toLowerCase()}`,
    });
    ophan.record({
        component: `ad-prefs`,
        value: `set-with-alert-views : ${getAlertViewCount()} : ${consent.cookie.toLowerCase()}`,
    });
};

const trackConsentCookies = (): void => {
    allAdConsents.forEach((consent: AdConsent) => {
        ophan.record({
            component: `ad-prefs`,
            value: `pv : ${String(
                getAdConsentState(consent)
            )} : ${consent.cookie.toLowerCase()}`,
        });
    });
};

export { onConsentSet, trackConsentCookies, upAlertViewCount };
