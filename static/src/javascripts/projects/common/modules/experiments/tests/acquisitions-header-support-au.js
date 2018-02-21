// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { updateAcquisitionData } from 'common/modules/commercial/acquisitions-ophan';

const componentType = 'ACQUISITIONS_HEADER';
const abTestName = 'AcquisitionsHeaderSupportAU';
const controlVariantName = 'control';
const subscribeOnlyVariantName = 'variant';

const modifySubscribeLink = (
    variant: string,
    subscribeOnlyBundle: boolean = false
) => {
    [...document.querySelectorAll('.js-subscribe')].forEach(subscribeLink => {
        if (subscribeLink instanceof HTMLAnchorElement) {
            const subscribeUrl: URL = new URL(subscribeLink.href);

            if (subscribeOnlyBundle) {
                subscribeUrl.searchParams.set('bundle', 'subscribe');
            }

            const subscribeUrlWithTestData = updateAcquisitionData(
                subscribeUrl,
                {
                    abTest: {
                        name: abTestName,
                        variant,
                    },
                }
            );

            subscribeLink.href = subscribeUrlWithTestData.toString();
        }
    });
};

export const acquisitionsHeaderSupportAU: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    componentType,
    start: '2018-02-27',
    expiry: '2018-04-01',
    author: 'Santiago Villa Fernandez',
    description:
        'Point the Support link in the header to a support in Australia',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV 2.0',
    audienceCriteria: 'All Australian web traffic',
    dataLinkNames: '',
    idealOutcome: 'We get more money by selling recurring contributions',
    canRun: () => geolocationGetSync() === 'AU',
    variants: [
        {
            id: controlVariantName,
            test: () => {
                modifySubscribeLink(controlVariantName);
            },
        },
        {
            id: subscribeOnlyVariantName,
            test: () => {
                modifySubscribeLink(subscribeOnlyVariantName, true);
            },
        },
    ],
};
