// @flow
import { makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const componentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsEngagementBannerUs23Cents';

export const AcquisitionsEngagementBannerUs23Cents: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-03-16',
    expiry: '2018-04-17',
    author: 'Jonathan Rankin',
    description:
        'Tests a CTA message that aims to push people towards recurring contributions',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All US transaction web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => geolocationGetSync() === 'US',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
        },
        {
            id: '23_cents',
            options: {
                engagementBannerParams: {
                    ctaText:
                        'Support The Guardian for just $0.23 a day or $7 a month.',
                },
            },
        },
    ]),
};
