// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

// Start running as soon as it's January 1, 2020 00:00:01 wherever you are
const is2020 = Date.now() > new Date('January 1, 2020 00:00:00').getTime();

const titles = ['As 2020 begins...'];
const messageText = `The stakes could hardly be higher. This year America faces an epic choice – and the result could define the country for a generation. Many vital aspects of American public life are in play – the supreme court, abortion rights, climate policy, wealth inequality, Big Tech and much more. The Guardian relies on your support. We hope you’ll make a contribution to the Guardian before our campaign closes early in the new year. Help us reach our $1.5m goal.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our goal';

export const contributionsBannerUsEoyNewYearCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyNewYearCasuals',
    campaignId: 'USeoy2019',
    start: '2019-12-23',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description:
        'US End of year banner - three day count without articles viewed',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'NA',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => isUS && is2020,
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
                tickerHeader,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
