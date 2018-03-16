// @flow
import { AcquisitionsEngagementBannerEurSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-eur-support';
import { AcquisitionsEngagementBannerAudSupport } from 'common/modules/experiments/tests/acquisitions-engagement-banner-aud-support';
import { AcquisitionsEngagementBannerUk17Pence } from 'common/modules/experiments/tests/acquisitions-engagement-banner-uk-17-pence';
import { AcquisitionsEngagementBannerUs23Cents } from 'common/modules/experiments/tests/acquisitions-engagement-banner-us-23-cents';

export const membershipEngagementBannerTests: $ReadOnlyArray<
    AcquisitionsABTest
> = [
    AcquisitionsEngagementBannerEurSupport,
    AcquisitionsEngagementBannerAudSupport,
    AcquisitionsEngagementBannerUk17Pence,
    AcquisitionsEngagementBannerUs23Cents,
];
