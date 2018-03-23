// @flow
import {
    getSupporterPaymentRegion as geolocationGetSupporterPaymentRegion,
    getSync as geolocationGetSync,
} from 'lib/geolocation';
import { updateAcquisitionData } from 'common/modules/commercial/acquisitions-ophan';

const componentType = 'ACQUISITIONS_HEADER';
const abTestName = 'AcquisitionsHeaderRowSupport';
const ROWsupportURL = 'https://support.theguardian.com/int';

type variantName = 'control' | 'support_contribute';

const modifySupportTheGuardianLink = (variant: variantName): void => {
    [...document.querySelectorAll('.js-change-become-member-link')].forEach(
        supportTheGuardianLink => {
            if (!(supportTheGuardianLink instanceof HTMLAnchorElement)) {
                return;
            }

            let supportTheGuardianURL = new URL(supportTheGuardianLink.href);

            if (variant === 'support_contribute') {
                supportTheGuardianURL = new URL(ROWsupportURL);
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

export const acquisitionsHeaderRowSupport: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    componentType,
    start: '2018-03-22',
    expiry: '2018-05-24',
    author: 'Santiago Villa Fernandez',
    description:
        'Points the "support the guardian" link in the header to the ROW version of the support site',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV 2.0',
    audienceCriteria: 'All ROW transaction web traffic.',
    idealOutcome: 'We get more money when we tailor the destination to the CTA',
    canRun: () =>
        geolocationGetSupporterPaymentRegion(geolocationGetSync()) === 'INT' &&
        geolocationGetSync() !== 'NZ',
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
