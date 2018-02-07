// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { addAcquisitionDataToURL } from 'common/modules/commercial/acquisitions-ophan';

const componentType = 'ACQUISITIONS_HEADER';
const abTestName = 'AcquisitionsHeaderSubscribeMeansSubscribe';
const controlVariantName = 'control';
const subscribeOnlyVariantName = 'subscribe_only';

const modifySubscribeLink = (variant: string) => {
    const subscribeLink = document.querySelector('.js-change-subscribe-link');
    if (subscribeLink instanceof HTMLAnchorElement) {
        const subscribeUrl: URL = new URL(subscribeLink.href);

        if (variant === subscribeOnlyVariantName) {
            subscribeUrl.searchParams.set('bundle', 'subscribe');
        }

        const newSubscribeUrl = addAcquisitionDataToURL(subscribeUrl, {
            abTest: {
                name: abTestName,
                variant,
            },
        });

        subscribeLink.setAttribute('href', newSubscribeUrl.toString());
    }
};

export const acquisitionsHeaderSubscribeMeansSubscribe: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    componentType,
    start: '2018-02-07',
    expiry: '2018-03-01',
    author: 'Joseph Smith',
    description:
        'Point the subscribe link in the header to a subscriptions-only version of the support site',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV 2.0',
    audienceCriteria: 'All web traffic',
    dataLinkNames: '',
    idealOutcome: 'We get more money when we tailor the destination to the CTA',
    canRun: () => geolocationGetSync() === 'GB',
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
                modifySubscribeLink(subscribeOnlyVariantName);
            },
        },
    ],
};
