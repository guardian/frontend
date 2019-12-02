// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['Offset fake news this Giving Tuesday'];
const messageText =
    'Help the truth triumph in 2020. Amid a tsunami of disinformation and “alternative facts”, the need for truth has never been greater. Support the Guardian’s independent, fact-based journalism this holiday season. As we look to the challenges of the coming year, we’re hoping to raise $1.5m from our US readers by January. ';
const closingSentence = 'Help us reach our year-end goal.';
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
                closingSentence,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader: tickerHeaderControl,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
