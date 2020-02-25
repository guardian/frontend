// @flow
import {
    type CountryGroupId,
    getSync as geolocationGetSync,
    countryCodeToCountryGroupId,
} from 'lib/geolocation';

import { acquisitionsBannerEuropeMomentTemplate } from 'common/modules/commercial/templates/acquisitions-banner-europe-moment';

const geolocation = geolocationGetSync();

const countryGroupId: CountryGroupId = countryCodeToCountryGroupId(geolocation);
const isEurope = countryGroupId === 'EURCountries';

const titles = ['Europe title'];
const messageText = 'We love Europe!!';

const ctaText = 'Support The Guardian';

export const contributionsEuropeMoment: AcquisitionsABTest = {
    id: 'ContributionsEuropeMoment',
    campaignId: 'EuropeMoment2020',
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
    canRun: () => isEurope,
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
                bannerModifierClass: 'europemoment',
            },
        },
    ],
};
