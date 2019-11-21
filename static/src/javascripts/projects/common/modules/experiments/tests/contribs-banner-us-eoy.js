// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const leadSentence = '2020 will be a defining year for America';
const messageTextV1 =
    'And the result could define the country for a generation. Many vital aspects of American public life are in play - the supreme court, abortion rights, climate policy, wealth inequality, Big Tech and more.  As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million.';
const messageTextV2 =
    'Over the last three years, much of what the Guardian holds dear has been threatened - democracy, civility, truth. This US administration is establishing new norms of behaviour. Truth is being chased away. But with your help we can continue put it center stage. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million.';
const ctaText = 'Support The Guardian';

export const contributionsBannerUsEoy: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoy',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'show number of articles viewed in contributions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => isUS,
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageTextV1,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
            },
        },
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                leadSentence,
                messageTextV2,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
            },
        },
    ],
};
