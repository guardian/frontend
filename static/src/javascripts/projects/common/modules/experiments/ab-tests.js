// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialAdVerification } from 'common/modules/experiments/tests/commercial-ad-verification.js';
import { commercialCmpCustomise } from 'common/modules/experiments/tests/commercial-cmp-customise.js';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialAdVerification,
    commercialCmpCustomise,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [

];
