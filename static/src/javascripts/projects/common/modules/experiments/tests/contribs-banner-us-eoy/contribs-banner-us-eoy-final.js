// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['Thank\xa0you\xa0to\xa0the\n30,000\xa0US\xa0readers …'];
const messageText = `… who have shown their support for our reader-supported, independent journalism. As we begin 2020, the stakes could hardly be higher. America faces an epic choice and the result could define the country for a generation. Thank you to everyone who has generously contributed to our appeal so far. There’s still time to help us hit our $1.5m goal before our campaign closes – we’re nearly there.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our goal';

export const contributionsBannerUsEoyFinal: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyFinal',
    campaignId: 'USeoy2019',
    start: '2019-12-23',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'US End of year banner - final push',
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
