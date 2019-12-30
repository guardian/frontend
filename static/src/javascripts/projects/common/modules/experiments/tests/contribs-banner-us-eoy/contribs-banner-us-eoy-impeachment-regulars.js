// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';
import { getDaysLeftBeforeEOY2019, daysLeftCopy } from './common';

// User must have read at least 6 articles this year to qualify
const minArticleViews = 6;
const articleCountWeeks = 26;
// Ensure accuracy of the "more than" copy
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks) - 1;

const daysLeft = getDaysLeftBeforeEOY2019();

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['At\xa0this\xa0historic\nmoment\xa0for\xa0America'];
const messageText = `Donald Trump has been impeached – only the third president in history to face this sanction. But the challenges to American democracy do not end here. 2020 will be an epic year – and the need for robust, independent reporting has never been greater. You’ve read more than ${articleViewCount} articles in 2019, and the Guardian relies on your support. Make a year-end gift today from as little as $1. Thank you.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyImpeachmentRegulars: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyImpeachmentCountDownRegulars',
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
    canRun: () => daysLeft > 0 && isUS && articleViewCount >= minArticleViews,
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
                tickerHeader: daysLeftCopy(daysLeft),
                bannerModifierClass: 'useoy2019',
            },
        },
    ],
};
