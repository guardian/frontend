// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['2020 will be a defining year for America'];
const messageTextV1 =
    'And the result could define the country for a generation. Many vital aspects of American public life are in play - the supreme court, abortion rights, climate policy, wealth inequality, Big Tech and more. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million.';
const messageTextV2 =
    'This year, much of what we hold dear has been threatened - democracy, civility, truth. This administration is establishing new norms of behaviour. Truth is being chased away. With your help we can continue to put it center stage. As we prepare for 2020, we’re asking our readers to help us raise $1.5 million.';
const ctaText = 'Support The Guardian';

const tickerHeaderControl = 'Help us reach our year-end goal';

export const contributionsBannerUsEoy: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoy',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'general banner for the US EOY campaign',
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
                messageText: messageTextV1,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader: tickerHeaderControl,
                bannerModifierClass: 'useoy2019',
            },
        },
        {
            id: 'variant',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText: messageTextV2,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader: tickerHeaderControl,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
