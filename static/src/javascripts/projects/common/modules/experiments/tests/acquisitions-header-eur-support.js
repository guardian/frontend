// @flow
import {
    getSupporterPaymentRegion as geolocationGetSupporterPaymentRegion,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { updateAcquisitionData } from 'common/modules/commercial/acquisitions-ophan';

const componentType = 'ACQUISITIONS_HEADER';
const abTestName = 'AcquisitionsHeaderEURSupport';
const EURsupportURL = 'https://support.theguardian.com/eu';

type variantName = 'control' | 'support_contribute';

const modifySupportTheGuardianLink = (variant: variantName): void => {
    [...document.querySelectorAll('.js-change-become-member-link')].forEach(
        supportTheGuardianLink => {
            if (!(supportTheGuardianLink instanceof HTMLAnchorElement)) {
                return;
            }

            let supportTheGuardianURL = new URL(supportTheGuardianLink.href);

            if (variant === 'support_contribute') {
                supportTheGuardianURL = new URL(EURsupportURL);
            }

            const supportTheGuardianUrlWithTestData = updateAcquisitionData(
                supportTheGuardianURL,
                {
                    abTest: {
                        name: abTestName,
                        variant,
                    },
                }
            );

            supportTheGuardianLink.href = supportTheGuardianUrlWithTestData.toString();
        }
    );
};

export const acquisitionsHeaderEurSupport: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    componentType,
    start: '2018-03-01',
    expiry: '2018-04-17',
    author: 'Santiago Villa Fernandez',
    description:
        'Points the "support the guardian" link in the header to the eur version of the support site',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV 2.0',
    audienceCriteria: 'All EUR transaction web traffic.',
    dataLinkNames: '',
    idealOutcome: 'We get more money when we tailor the destination to the CTA',
    canRun: () =>
        geolocationGetSupporterPaymentRegion(geolocationGetSync()) === 'EU',
    variants: [
        {
            id: 'control',
            test: () => {
                modifySupportTheGuardianLink('control');
            },
        },
        {
            id: 'support_contribute',
            test: () => {
                modifySupportTheGuardianLink('support_contribute');
            },
        },
    ],
};
