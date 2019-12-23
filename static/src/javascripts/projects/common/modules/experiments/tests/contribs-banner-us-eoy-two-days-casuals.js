// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { canShowBannerSync } from 'common/modules/commercial/contributions-utilities';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['2 days left to give to the Guardian in 2019'];
const messageText = `… and two supreme court justices Donald Trump has appointed in his first term. The next US president will shape the court for the next half century – and the future of LGBTQ+ rights, immigration, abortion, guns, religion, dark money and more are in play. As we prepare for 2020, we’re asking our US readers to help us raise $1.5 million to cover the issues that matter.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyTwoDaysCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyTwoDaysCasuals',
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
