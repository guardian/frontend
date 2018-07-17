// @flow
import { local } from 'lib/storage';

type LotameError = {
    error: number,
};

type LotameConsentType = {
    name: string,
    consent: boolean,
};

type LotameClientConsent = {
    clientId: string,
    lastupdate: number,
    types: Array<LotameConsentType>,
};

type LotameSuccess = {
    consent: Array<LotameClientConsent>,
};

const clientId = 12666;
const lotameVendorId = 95;
const lotameConsent = 'lotameConsent';

const lotameConsentData = (isConsenting: boolean) => ({
    analytics: isConsenting,
    crossdevice: isConsenting,
    datasharing: isConsenting,
    targeting: isConsenting,
});

const getLotameConsent = (): number => local.get(lotameConsent);

const setLotameConsent = (consent: boolean) =>
    local.set(lotameConsent, consent ? 1 : 0);

const lotameCallback = (data: LotameSuccess | LotameError): void => {
    console.log(`lotameCallback: ${JSON.stringify(data)}`);
    if ('error' in data) {
        setLotameConsent(false);
    } else if ('consent' in data) {
        setLotameConsent(true);
    }
};

const isConsentingData = (consentData): boolean => {
    try {
        const vendorConsents = consentData.vendorConsents;
        const purposeConsents = consentData.purposeConsents;
        return (
            Object.keys(vendorConsents).every(k => vendorConsents[k]) &&
            Object.keys(purposeConsents).every(k => purposeConsents[k])
        );
    } catch (e) {
        return false;
    }
};

const getLotameAdConsent = (): Promise<any> =>
    new Promise((resolve, reject) => {
        if ('__cmp' in window) {
            /*eslint-disable */
            window.__cmp(
                /* eslint-enable */
                'getVendorConsents',
                [lotameVendorId],
                (consentData, success) =>
                    success
                        ? resolve(consentData)
                        : reject(Error('Error calling getVendorConsents'))
            );
        } else {
            reject(Error('__cmp does not exist on the window'));
        }
    });

const init = () => {
    console.log(`Initialising lotame consent`);
    if ('LOTCC' in window && 'setConsent' in window.LOTCC) {
        getLotameAdConsent()
            .then(isConsentingData)
            .then(isConsenting => {
                console.log(`isConsenting: ${isConsenting.toString()}`);
                const localConsenting: boolean = !!getLotameConsent();
                if (localConsenting !== isConsenting) {
                    setLotameConsent(isConsenting);
                    return window.LOTCC.setConsent(
                        lotameCallback,
                        clientId,
                        lotameConsentData(isConsenting)
                    );
                }
            });
    }
};

export { init };
