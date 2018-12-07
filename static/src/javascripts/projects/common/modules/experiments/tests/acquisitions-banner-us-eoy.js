// @flow strict
import {
    makeBannerABTestVariants,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const componentType: OphanComponentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';

const abTestName = 'AcquisitionsBannerUsEoy';

const controlParams = {
    messageText: '<strong>The Guardian is editorially independent – our journalism is free from the influence of billionaire owners or politicians. No one edits our editor. No one steers our opinion.</strong> And unlike many others, we haven’t put up a paywall as we want to keep our journalism open and accessible. But the revenue we get from advertising is falling, so we increasingly need our readers to help fund us. By contributing to The Guardian, you are helping sustain the long term future of independent, investigative journalism and ensuring it remains available to all.',
    buttonCaption: 'Support The Guardian',
    ctaText: ' <span class="engagement-banner__highlight">Support The Guardian from as little as $1.</span>',
    linkUrl: 'https://support.theguardian.com/contribute',
};

const criticalTimesParams = {
    messageText: '<strong>In these critical times, make a year-end gift to The Guardian to help us protect independent journalism at a time when factual, trustworthy reporting is under threat.</strong> Our editorial independence means we can pursue difficult investigations, challenging the powerful and holding them to account. And our journalism is open to everyone, regardless of what they can afford. But we depend on voluntary contributions from readers. We’re in this together – please make a year-end gift today to help us deliver the independent journalism the world needs for 2019 and beyond.',
    buttonCaption: 'Support The Guardian',
    ctaText: 'We’re in this together – please make a year-end gift today to help us deliver the independent journalism the world needs for 2019 and beyond.',
    linkUrl: 'https://support.theguardian.com/contribute',
};

export const AcquisitionsBannerUsEoy =  {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-08-06',
    expiry: '2019-06-06',
    author: 'Joseph Smith',
    description: 'Tests a custom banner for US campaign',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'All web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => geolocationGetSync() === 'US',

    variants: makeBannerABTestVariants([
        {
            id: 'control',
            products: [],
            engagementBannerParams: () => Promise.resolve({
                ...controlParams,
                hasTicker: false,
            })
        },
        {
            id: 'control_copy_with_ticker',
            products: [],
            engagementBannerParams: () => Promise.resolve({
                ...controlParams,
                hasTicker: true,
            })
        },
        {
            id: 'critical_times_with_ticker',
            products: [],
            engagementBannerParams: () => Promise.resolve({
                ...criticalTimesParams,
                hasTicker: true,
            })
        }
    ]),
};
