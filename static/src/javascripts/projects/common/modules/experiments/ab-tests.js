// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialCmpCustomise } from 'common/modules/experiments/tests/commercial-cmp-customise.js';
import { commercialOutbrainTesting } from 'common/modules/experiments/tests/commercial-outbrain-testing.js';
import { commercialConsentModalBanner } from 'common/modules/experiments/tests/commercial-consent-modal-banner';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { articlesViewed } from 'common/modules/experiments/tests/contributions-epic-articles-viewed';
import { countryName } from 'common/modules/experiments/tests/contributions-epic-country-name';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { contributionsGlobalMobileBannerDesign } from 'common/modules/experiments/tests/contribs-global-mobile-banner-design';
import { commercialUsMobileSticky } from 'common/modules/experiments/tests/commercial-us-mobile-sticky';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialCmpCustomise,
    commercialOutbrainTesting,
    adblockTest,
    commercialConsentModalBanner,
    commercialUsMobileSticky,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    articlesViewed,
    countryName,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsGlobalMobileBannerDesign,
];
