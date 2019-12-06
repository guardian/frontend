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
import { signInGatePrius } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { contributionsBannerUsEoy } from 'common/modules/experiments/tests/contribs-banner-us-eoy';
import { commercialCmpUiNoOverlay } from 'common/modules/experiments/tests/commercial-cmp-ui-no-overlay';
import { commercialConsentOptionsButton } from 'common/modules/experiments/tests/commercial-consent-options-button';
import { contributionsBannerUsEoyGivingTuesdayCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy-giving-tuesday-casuals';
import { contributionsBannerUsEoyGivingTuesdayRegulars } from 'common/modules/experiments/tests/contribs-banner-us-eoy-giving-tuesday-regulars';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialCmpUiIab,
    adblockTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    signInGatePrius,
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
    contributionsBannerUsEoyGivingTuesdayRegulars,
    contributionsBannerUsEoyGivingTuesdayCasuals,
    contributionsBannerUsEoy,
    articlesViewedBanner,
];
