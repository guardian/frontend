// @flow strict
import {
    AcquisitionsBannerGoogleDocTestOneVariant,
    AcquisitionsBannerGoogleDocTestTwoVariants,
    AcquisitionsBannerGoogleDocTestThreeVariants,
    AcquisitionsBannerGoogleDocTestFourVariants,
    AcquisitionsBannerGoogleDocTestFiveVariants,
} from 'common/modules/experiments/tests/acquisitions-banner-from-google-doc';
import { AcquisitionsBannerAustraliaPostOneMillionTest } from './acquisitions-banner-australia-post-one-million';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsBannerAustraliaPostOneMillionTest,
    AcquisitionsBannerGoogleDocTestOneVariant,
    AcquisitionsBannerGoogleDocTestTwoVariants,
    AcquisitionsBannerGoogleDocTestThreeVariants,
    AcquisitionsBannerGoogleDocTestFourVariants,
    AcquisitionsBannerGoogleDocTestFiveVariants,
];
