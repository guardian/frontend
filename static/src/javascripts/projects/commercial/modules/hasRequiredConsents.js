import {
	onConsentChange
} from '@guardian/consent-management-platform';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

export const hasRequiredConsents = () =>
    new Promise((resolve) => {
        onConsentChange(({ tcfv2, ccpa, aus }) => {
            if (tcfv2) {
                resolve(tcfv2.vendorConsents[brazeVendorId]);
            } else if (ccpa) {
                resolve(!ccpa.doNotSell);
            } else if (aus) {
                resolve(aus.personalisedAdvertising);
            } else {
                resolve(false);
            }
        })
    });
