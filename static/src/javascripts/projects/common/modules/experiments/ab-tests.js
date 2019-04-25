// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialAdVerification } from 'common/modules/experiments/tests/commercial-ad-verification.js';
import { commercialCmpCustomise } from 'common/modules/experiments/tests/commercial-cmp-customise.js';
import { commercialOutbrainTesting } from 'common/modules/experiments/tests/commercial-outbrain-testing.js';
import { commercialConsentGlobalNoScroll } from 'common/modules/experiments/tests/commercial-consent-global-no-scroll.js';
import { commercialConsentGlobalTallBanner } from 'common/modules/experiments/tests/commercial-consent-global-tall-banner.js';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { contributionsGlobalMobileBannerDesign } from 'common/modules/experiments/tests/contribs_global_mobile_banner_design';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialAdVerification,
    commercialCmpCustomise,
    commercialOutbrainTesting,
    commercialConsentGlobalNoScroll,
    adblockTest,
    commercialConsentGlobalTallBanner,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsGlobalMobileBannerDesign,
];
