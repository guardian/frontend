// @flow
import { AcquisitionsEngagementBannerAudSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-aud-support';
import { AcquisitionsEngagementBannerRowSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-row-support';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsEngagementBannerAudSupport,
    AcquisitionsEngagementBannerRowSupport,
];
