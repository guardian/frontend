// @flow
import { AcquisitionsEngagementBannerEurSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-eur-support';
import { AcquisitionsEngagementBannerAudSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-aud-support';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsEngagementBannerEurSupport,
    AcquisitionsEngagementBannerAudSupport,
];
