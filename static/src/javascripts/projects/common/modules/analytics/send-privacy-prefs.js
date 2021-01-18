import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';

const alertViewCount = 'first-pv-consent.lifetime-views';

const getAlertViewCount = () =>
    parseInt(userPrefs.get(alertViewCount) || 0, 10);

const upAlertViewCount = () => {
    userPrefs.set(alertViewCount, getAlertViewCount() + 1);
    ophan.record({
        component: `privacy-prefs`,
        value: `lifetime-alert-views : ${getAlertViewCount()}`,
    });
};

const resetAlertViewCount = () => {
    userPrefs.set(alertViewCount, 0);
};

const onConsentSet = (consent, status) => {
    ophan.record({
        component: `privacy-prefs`,
        value: `set : ${String(status)} : ${consent.cookie.toLowerCase()}`,
    });
    resetAlertViewCount();
};

const trackConsentCookies = (
    allConsentsWithState
) => {
    allConsentsWithState.forEach((consentWithState) => {
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
