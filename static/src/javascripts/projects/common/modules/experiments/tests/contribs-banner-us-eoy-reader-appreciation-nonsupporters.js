// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';
import { getArticleViewCountForWeeks } from 'common/modules/onward/history';

// User must have read at least 5 articles in last 60 days
const minArticleViews = 5;
const articleCountWeeks = 26; // Requesting a half year in order to get as many as possible for this and next iterations
const articleViewCount = getArticleViewCountForWeeks(articleCountWeeks);

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const titles = ['It’s because of you...'];
const messageText = `... and the readers across all 50 states that support us in 2019 that our journalism thrived in a challenging climate for publishers. Next year America faces an epic choice and the need for an independent press has never been greater. In the last three months you’ve read ${articleViewCount} articles. Support from our readers is vital. Please consider supporting us today with a year-end gift. Contribute from as little as $1 and help us reach our goal.`;
const ctaText = 'Support The Guardian';
const tickerHeader = 'Help us reach our year-end goal';

export const contributionsBannerUsEoyReaderAppreciationNonsupporters: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoyReaderAppreciationNonsupporters',
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
    canRun: () => isUS && articleViewCount >= minArticleViews,
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
