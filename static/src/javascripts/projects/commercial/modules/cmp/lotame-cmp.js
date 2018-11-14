// @flow strict
import { local } from 'lib/storage';
import type { VendorConsentResponse } from './types';

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

const clientId: number = 12666;
const lotameVendorId: number = 95;
const lotameConsentKey: string = 'lotameConsent';

const lotameConsentData = (isConsenting: boolean) => ({
    analytics: isConsenting,
    crossdevice: isConsenting,
    datasharing: isConsenting,
    targeting: isConsenting,
});

const getLotameConsent = (): boolean => local.get(lotameConsentKey);

const setLotameConsent = (consent: boolean) =>
    local.set(lotameConsentKey, consent);

const lotameCallback = (isConsenting: boolean) => (
    data: LotameSuccess | LotameError
): void => {
    if ('error' in data) {
        setLotameConsent(false);
    } else if ('consent' in data) {
        setLotameConsent(isConsenting);
    }
};

const isConsentingData = (
    consentData: VendorConsentResponse | null
): boolean => {
    if (consentData) {
        const vendorConsents = consentData.vendorConsents;
        const purposeConsents = consentData.purposeConsents;
        return (
            Object.keys(vendorConsents).every(k => vendorConsents[k]) &&
            Object.keys(purposeConsents).every(k => purposeConsents[k])
        );
    }
    return false;
};

const getLotameAdConsentFromCmp = (): Promise<VendorConsentResponse | null> =>
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

const init = (): void => {
    if ('LOTCC' in window && 'setConsent' in window.LOTCC) {
        getLotameAdConsentFromCmp()
            .then(isConsentingData)
            .then(isConsenting => {
                const localConsenting: boolean = !!getLotameConsent();
                if (localConsenting !== isConsenting) {
                    return window.LOTCC.setConsent(
                        lotameCallback(isConsenting),
                        clientId,
                        lotameConsentData(isConsenting)
                    );
                }
            })
            .catch(error =>
                console.error(
                    `Error with lotame initialisation: ${error.toString()}`
                )
            );
    }
};

export { init };
