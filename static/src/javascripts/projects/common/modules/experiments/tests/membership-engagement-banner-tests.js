// @flow strict
import {
    AcquisitionsBannerGoogleDocTestOneVariant,
    AcquisitionsBannerGoogleDocTestTwoVariants,
    AcquisitionsBannerGoogleDocTestThreeVariants,
    AcquisitionsBannerGoogleDocTestFourVariants,
    AcquisitionsBannerGoogleDocTestFiveVariants,
} from 'common/modules/experiments/tests/acquisitions-banner-from-google-doc';
import { AcquisitionsBannerAustraliaPostOneMillionTest } from 'common/modules/experiments/tests/acquisitions-banner-australia-post-one-million';
import { AcquisitionsBannerUsEoy } from 'common/modules/experiments/tests/acquisitions-banner-us-eoy';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsBannerUsEoy,
    AcquisitionsBannerAustraliaPostOneMillionTest,
    AcquisitionsBannerGoogleDocTestOneVariant,
    AcquisitionsBannerGoogleDocTestTwoVariants,
    AcquisitionsBannerGoogleDocTestThreeVariants,
    AcquisitionsBannerGoogleDocTestFourVariants,
    AcquisitionsBannerGoogleDocTestFiveVariants,
];
