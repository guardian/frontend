// @flow
import { getSync as geolocationGetSync } from 'lib/geolocation';

import { acquisitionsBannerUsEoyTemplate } from 'common/modules/commercial/templates/acquisitions-banner-us-eoy';

const geolocation = geolocationGetSync();
const isUS = geolocation === 'US';

const leadSentence = 'As\xa0we\xa0head\xa0into\nanother\xa0pivotal\xa0year...';
const messageText =
    'We are asking you to support our independent journalism. Guardian reporting is based in fact, and as a news organisation, we are progressive in how we view the world and respond to it. Whether we are up close or far away, we provide a global perspective on the most critical issues of our lifetimes.';
const ctaText = 'Support The Guardian';

export const contributionsBannerUsEoy: AcquisitionsABTest = {
    id: 'ContributionsBannerUsEoy',
    campaignId: 'USeoy2019',
    start: '2019-11-15',
    expiry: '2020-1-30',
    author: 'Joshua Lieberman',
    description: 'show number of articles viewed in contributions banner',
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
                leadSentence,
                messageText,
                ctaText,
                template: acquisitionsBannerUsEoyTemplate,
                hasTicker: true,
            },
        },
    ],
};
