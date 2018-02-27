// @flow

import { AcquisitionsBannerCtaContribute } from 'common/modules/experiments/tests/acquisitions-banner-cta-contribute';
import { SupportEngagementBannerCircles } from 'common/modules/experiments/tests/support-engagement-banner-circles';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [AcquisitionsBannerCtaContribute, SupportEngagementBannerCircles];
