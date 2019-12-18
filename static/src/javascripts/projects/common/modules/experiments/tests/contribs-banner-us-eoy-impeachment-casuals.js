// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getDaysLeftInCampaign } from 'common/modules/onward/history';

// Code for countdown copy
const countDownEnd = new Date('Dec 31, 2019 23:59:59').getTime();
const daysLeft = getDaysLeftInCampaign(countDownEnd);

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['At\xa0this\xa0historic\nmoment\xa0for\xa0America'];
const messageText = `Donald Trump has been impeached – only the third president in history to face this sanction. But the challenges to American democracy do not end today. 2020 will be an epic year – and the need for robust, independent reporting has never been greater. The Guardian relies on your support. Make a year-end gift today from as little as $1. Thank you.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our year-end goal';
const tickerHeaderVariant = `${daysLeft} days left in 2019`;

export const contributionsBannerUsEoyImpeachmentCasuals: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyImpeachmentCasuals',
    campaignId: 'USeoy2019',
    start: '2019-12-16',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description:
        'reader appreciation banner for the US EOY campaign - potential supporters with article count',
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
        {
            id: 'countdown',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
                tickerHeader: tickerHeaderVariant,
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
