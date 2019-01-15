// @flow strict
import { makeBannerABTestVariant, makeBannerABTestVariants } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

const componentType: OphanComponentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const abTestName = 'AcquisitionsBannerAustraliaPostOneMillion';
const variantAParams = {
    messageText:
        '<strong>With the support of one million Guardian readers, including 89,000 supporters in Australia, we remain editorially independent.</strong> Support from our readers keeps our journalism free from commercial bias and our reporting open and accessible to all. Imagine what we could continue to achieve with the support of many more of you. Together we can be a force for change.',
};

export const AcquisitionsBannerAustraliaPostOneMillionTest: AcquisitionsABTest = {
    id: abTestName,
    campaignId: abTestName,
    start: '2018-12-03',
    expiry: '2019-06-06',
    author: 'Emma Milner',
    description: 'Tests a banner with custom copy in Australia',
    audience: 1,
    audienceOffset: 0,
    audienceCriteria: 'AU web traffic.',
    successMeasure: 'AV 2.0',
    idealOutcome: 'Increase in overall AV, and AV from recurring',
    componentType,
    showForSensitive: true,
    canRun: () => geolocationGetSync() === 'AU',

    variants: makeBannerABTestVariants([
        makeBannerABTestVariant('AU2018_POST_1M_EB', variantAParams),
    ]),
};
