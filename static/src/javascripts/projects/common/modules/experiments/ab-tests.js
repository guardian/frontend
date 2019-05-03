// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialAdVerification } from 'common/modules/experiments/tests/commercial-ad-verification.js';
import { commercialCmpCustomise } from 'common/modules/experiments/tests/commercial-cmp-customise.js';
import { commercialOutbrainTesting } from 'common/modules/experiments/tests/commercial-outbrain-testing.js';
import { commercialConsentGlobalNoScroll } from 'common/modules/experiments/tests/commercial-consent-global-no-scroll.js';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { contributionsGlobalMobileBannerDesign } from 'common/modules/experiments/tests/contribs-global-mobile-banner-design';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialAdVerification,
    commercialCmpCustomise,
    commercialOutbrainTesting,
    commercialConsentGlobalNoScroll,
    adblockTest,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    /** *********************************************************
     2 May 2019 - JTL - This test is disabled as of 2 May 2019
     This test went out on mobile devices the same day as a
     global copy test went out across all devices. The copy
     test runs before tests in the code (per `ab.js`) which is
     desired behavior. A user can only be assigned to one banner
     test at a time (also desired), so we decided to give the
     copy test time precedence over this test.

     TBD: Re-enable this test to run after the copy test has run
     Steps:
     1. Enable on switchboard
     2. Test
     3. Remove this copy, merge, test again
     ********************************************************** */
    contributionsGlobalMobileBannerDesign,
];
