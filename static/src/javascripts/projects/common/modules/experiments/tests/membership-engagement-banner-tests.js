// @flow
import { AcquisitionsEngagementBannerAudSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-aud-support';
import { AcquisitionsEngagementBannerRowSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-row-support';
import { AcquisitionsEngagementBannerUk17Pence } from 'common/modules/experiments/tests/acquisitions-engagement-banner-uk-17-pence';
import { AcquisitionsEngagementBannerUs23Cents } from 'common/modules/experiments/tests/acquisitions-engagement-banner-us-23-cents';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsEngagementBannerAudSupport,
    AcquisitionsEngagementBannerRowSupport,
    AcquisitionsEngagementBannerUk17Pence,
    AcquisitionsEngagementBannerUs23Cents,
];
