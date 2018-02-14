// @flow
import { ColourTestBannerHoldback } from 'common/modules/experiments/tests/circles-banner-holdback';
import { AcquisitionsBannerCtaContribute } from 'common/modules/experiments/tests/acquisitions-banner-cta-contribute';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [AcquisitionsBannerCtaContribute, ColourTestBannerHoldback];
