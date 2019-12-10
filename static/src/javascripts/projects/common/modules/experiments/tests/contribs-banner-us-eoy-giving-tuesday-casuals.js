// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['2020 will be a defining year for America'];
const messageText =
    'This year, much of what we hold dear has been threatened – democracy, civility, truth. This administration is establishing new norms of behaviour. Truth is being chased away. With your help we can continue put it center stage. As we prepare for 2020, we’re asking our readers to help us raise $1.5 million. Help us reach our year-end goal.';
const ctaText = 'Support The Guardian';

const tickerHeaderControl = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyGivingTuesdayCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyGivingTuesdayCasuals',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description:
        'banner for the US EOY campaign for readers who have seen fewer than 5 articles',
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
    ],
};
