// @flow
import { SupportEngagementBannerCircles } from 'common/modules/experiments/tests/support-engagement-banner-circles';
import { AcquisitionsEngagementBannerEurSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-eur-support';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [SupportEngagementBannerCircles, AcquisitionsEngagementBannerEurSupport];
