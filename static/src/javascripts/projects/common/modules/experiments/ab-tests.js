// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialIabBottomConsentBanner } from 'common/modules/experiments/tests/commercial-iab-bottom-consent-banner';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { commercialCmpUiNonDismissable } from 'common/modules/experiments/tests/commercial-cmp-ui-non-dismissable';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { articlesViewed } from 'common/modules/experiments/tests/contributions-epic-articles-viewed';
import { countryName } from 'common/modules/experiments/tests/contributions-epic-country-name';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import { permutiveTest } from 'common/modules/experiments/tests/commercial-permutive';
import { signInGateFirstTest } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { contributionsBannerUsEoy } from 'common/modules/experiments/tests/contribs-banner-us-eoy';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialCmpUiIab,
    adblockTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    permutiveTest,
    commercialCmpUiNonDismissable,
    signInGateFirstTest,
    commercialIabBottomConsentBanner,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    articlesViewed,
    countryName,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerUsEoy,
    articlesViewedBanner,
];
