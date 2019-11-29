// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['Offset fake news this Giving Tuesday'];
const messageText =
    'And the result could define the country for a generation. Many vital aspects of American public life are in play - the supreme court, abortion rights, climate policy, wealth inequality, Big Tech and more. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million.';
const ctaText = 'Support The Guardian';

const tickerHeaderControl = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyGivingTuesdayCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyGivingTuesdayCasuals',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'banner for the US EOY campaign for readers who have seen fewer than 5 articles',
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
                titles,
                messageText,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader: tickerHeaderControl,
                bannerModifierClass: 'useoy2019',
            },
        },
        ,
    ],
};
