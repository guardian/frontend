// @flow strict
import {
    makeBannerABTestVariants,
    makeGoogleDocBannerControl,
} from 'common/modules/commercial/contributions-utilities';

const componentType: OphanComponentType = 'ACQUISITIONS_ENGAGEMENT_BANNER';
const getTestName = (variantName: string): string =>
    `AcquisitionsBannerFromGoogleDoc${variantName}`;

const acquisitionsBannerGoogleDocTest = (
    noOfVariants: number,
    variantName: string
): AcquisitionsABTest => {
    const abTestName = getTestName(variantName);

    return {
        id: abTestName,
        campaignId: abTestName,
        start: '2018-08-06',
        expiry: '2019-06-06',
        author: 'Emma Milner',
        description: 'Tests a banner with copy defined in google doc',
        audience: 1,
        audienceOffset: 0,
        audienceCriteria: 'All web traffic.',
        successMeasure: 'AV 2.0',
        idealOutcome: 'Increase in overall AV, and AV from recurring',
        componentType,
        showForSensitive: true,
        canRun: () => true,

        variants: makeBannerABTestVariants([
            makeGoogleDocBannerControl(),
            ...makeGoogleDocBannerVariants(noOfVariants),
        ]),
    };
};

export const AcquisitionsBannerGoogleDocTestOneVariant = acquisitionsBannerGoogleDocTest(
    1,
    'OneVariant'
);
export const AcquisitionsBannerGoogleDocTestTwoVariants = acquisitionsBannerGoogleDocTest(
    2,
    'TwoVariants'
);
export const AcquisitionsBannerGoogleDocTestThreeVariants = acquisitionsBannerGoogleDocTest(
    3,
    'ThreeVariants'
);
export const AcquisitionsBannerGoogleDocTestFourVariants = acquisitionsBannerGoogleDocTest(
    4,
    'FourVariants'
);
export const AcquisitionsBannerGoogleDocTestFiveVariants = acquisitionsBannerGoogleDocTest(
    5,
    'FiveVariants'
);
