// @flow strict
import {AcquisitionsBannerGoogleDocTestOneVariant,
        AcquisitionsBannerGoogleDocTestTwoVariants,
        AcquisitionsBannerGoogleDocTestThreeVariants,
        AcquisitionsBannerGoogleDocTestFourVariants,
        AcquisitionsBannerGoogleDocTestFiveVariants,
} from 'common/modules/experiments/tests/acquisitions-banner-from-google-doc';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [AcquisitionsBannerGoogleDocTestOneVariant];
