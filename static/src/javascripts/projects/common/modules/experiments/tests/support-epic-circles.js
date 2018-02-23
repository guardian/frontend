// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { getSync as getGeoLocation } from 'lib/geolocation';

const targetUrl = () => {
    const fromGeo = getGeoLocation();
    if (fromGeo === 'US') return 'https://support.theguardian.com/us/contribute';
    if (fromGeo === 'GB') return 'https://support.theguardian.com/uk/contribute';
    return 'https://support.theguardian.com/';
};
export const supportEpicCircles = makeABTest({
    id: 'SupportEpicCircles',
    campaignId: 'sandc_circles',

    start: '2018-02-21',
    expiry: '2018-03-13', // Tues 13th March (but should be complete by the 8th)

    author: 'Justin Pinner',
    description:
        'Use the Epic to partition the audience for the support circles test',
    successMeasure: 'N/A',
    idealOutcome:
        'We channel an even split of frontend traffic into the circles version of support',
    audienceCriteria: 'Entire UK and US',
    audience: 1,
    audienceOffset: 0,
    canRun: () => getGeoLocation() === 'US' || getGeoLocation() === 'GB',

    variants: [
        {
            id: 'variant',
            products: [],
            options: {
                isUnlimited: true,
                supportBaseURL: targetUrl(),
            },
        },
        {
            id: 'control',
            products: [],
            options: {
                isUnlimited: true,
            },
        },
    ],
});
