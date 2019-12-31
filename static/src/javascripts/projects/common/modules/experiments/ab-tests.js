// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { articlesViewed } from 'common/modules/experiments/tests/contributions-epic-articles-viewed';
import { countryName } from 'common/modules/experiments/tests/contributions-epic-country-name';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import { signInGateSecundus } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { commercialCmpUiNoOverlay } from 'common/modules/experiments/tests/commercial-cmp-ui-no-overlay';
import { commercialConsentOptionsButton } from 'common/modules/experiments/tests/commercial-consent-options-button';
import { contributionsBannerUsEoyOneDayCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy/contribs-banner-us-eoy-one-day-casuals';
import { contributionsBannerUsEoyOneDayRegulars } from 'common/modules/experiments/tests/contribs-banner-us-eoy/contribs-banner-us-eoy-one-day-regulars';
import { contributionsBannerUsEoyNewYearCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy/contribs-banner-us-eoy-new-year-casuals';
import { contributionsBannerUsEoyNewYearRegulars } from 'common/modules/experiments/tests/contribs-banner-us-eoy/contribs-banner-us-eoy-new-year-regulars';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialCmpUiIab,
    adblockTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    signInGateSecundus,
    commercialCmpUiNoOverlay,
    commercialConsentOptionsButton,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    articlesViewed,
    countryName,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerUsEoyNewYearRegulars,
    contributionsBannerUsEoyNewYearCasuals,
    contributionsBannerUsEoyOneDayRegulars,
    contributionsBannerUsEoyOneDayCasuals,
    articlesViewedBanner,
];
