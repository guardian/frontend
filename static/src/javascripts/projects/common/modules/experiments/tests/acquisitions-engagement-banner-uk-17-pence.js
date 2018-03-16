// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerUk17Pence';

export const AcquisitionsEngagementBannerUk17Pence: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-03-16',
    expiry: '2018-04-17',
    author: 'Jonathan Rankin',
    description:
        'Tests a CTA message that aims to push people towards recurring contributions',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All UK transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => geolocationGetSync() === 'GB',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: '17_pence',
            options: {
                engagementBannerParams: {
                    ctaText:
                        'Support The Guardian for just 17p a day or £5 a month.',
                },
            },
        },
    ]),
};
