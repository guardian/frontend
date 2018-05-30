// @flow
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';
import type {
    AdConsent,
    AdConsentWithState,
} from 'common/modules/commercial/ad-prefs.lib';

const alertViewCount: string = 'first-pv-consent.lifetime-views';

const getAlertViewCount = (): number =>
    parseInt(userPrefs.get(alertViewCount) || 0, 10);

const upAlertViewCount = (): void => {
    userPrefs.set(alertViewCount, getAlertViewCount() + 1);
    ophan.record({
        component: `privacy-prefs`,
        value: `lifetime-alert-views : ${getAlertViewCount()}`,
    });
};

const resetAlertViewCount = (): void => {
    userPrefs.set(alertViewCount, 0);
};

const onConsentSet = (consent: AdConsent, status: ?boolean): void => {
    ophan.record({
        component: `privacy-prefs`,
        value: `set : ${String(status)} : ${consent.cookie.toLowerCase()}`,
    });
    resetAlertViewCount();
};

const trackConsentCookies = (
    allConsentsWithState: AdConsentWithState[]
): void => {
    allConsentsWithState.forEach((consentWithState: AdConsentWithState) => {
        ophan.record({
            component: `privacy-prefs`,
            value: `pv : ${String(
                consentWithState.state
            )} : ${consentWithState.consent.cookie.toLowerCase()}`,
        });
    });
};

export {
    onConsentSet,
    trackConsentCookies,
    upAlertViewCount,
    getAlertViewCount,
};
