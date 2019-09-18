// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialIabCompliant } from 'common/modules/experiments/tests/commercial-iab-compliant';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { articlesViewed } from 'common/modules/experiments/tests/contributions-epic-articles-viewed';
import { countryName } from 'common/modules/experiments/tests/contributions-epic-country-name';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { prebidTripleLiftAdapter } from 'common/modules/experiments/tests/prebid-triple-lift-adapter';
import { learnMore } from 'common/modules/experiments/tests/contributions-epic-learn-more-cta';
import { commercialInline1Headings } from 'common/modules/experiments/tests/commercial-inline1-headings';
import {
    environmentMomentBannerNonSupporters,
    environmentMomentBannerSupporters,
} from 'common/modules/experiments/tests/contributions-moment-banner-environment';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialIabCompliant,
    adblockTest,
    prebidTripleLiftAdapter,
    commercialInline1Headings,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    articlesViewed,
    learnMore,
    countryName,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    environmentMomentBannerNonSupporters,
    environmentMomentBannerSupporters,
    articlesViewedBanner,
];
