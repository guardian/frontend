// @flow
import {
    type CountryGroupId,
    getSync as geolocationGetSync,
    countryCodeToCountryGroupId,
} from 'lib/geolocation';

import { acquisitionsBannerEuropeMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-europe-moment';

const geolocation = geolocationGetSync();

const countryGroupId: CountryGroupId = countryCodeToCountryGroupId(geolocation);
const isEuropeAndUk =
    countryGroupId === 'EURCountries' || countryGroupId === 'GBPCountries';

const titles = [`We're going beyond borders`];
const messageText =
    '…Britain may be leaving the EU, but the Guardian remains committed to Europe, doubling down on the ideas and interests that we share. These are testing times, and crises are not limited by national boundaries. But then neither are we. We will stay with you, delivering quality, investigative journalism so we can all make up our minds based on fact, not fiction.';

const ctaText = 'Support The Guardian';

export const contributionsEuropeMoment: AcquisitionsABTest = {
    id: 'ContributionsEuropeMoment',
    campaignId: 'this_is_europe',
    start: '2020-03-02',
    expiry: '2020-04-01',
    author: 'Thalia Silver',
    description: 'custom banner for the Europe Moment',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'AV per impression',
    audienceCriteria: 'All',
    idealOutcome: 'variant design performs at least as well as control',
    showForSensitive: true,
    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
    canRun: () => isEuropeAndUk,
    geolocation,
    variants: [
        {
            id: 'control',
            test: (): void => {},
            engagementBannerParams: {
                titles,
                messageText,
                ctaText,
                template: acquisitionsBannerEuropeMomentTemplate,
                hasTicker: true,
                bannerModifierClass: 'europe-moment',
                minArticlesBeforeShowingBanner: 2,
            },
        },
    ],
};
