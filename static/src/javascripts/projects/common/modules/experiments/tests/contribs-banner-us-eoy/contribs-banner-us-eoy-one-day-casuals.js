// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['1 day left to give to the Guardian in 2019'];
const messageText = `… and one year left in Donald Trump’s first term. Over the last three years, much of what the Guardian holds dear has been threatened – democracy, civility, truth. As 2020 approaches, the need for a robust, independent press has never been greater. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million to cover the issues that matter.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyOneDayCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyOneDayCasuals',
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
                tickerHeader,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
