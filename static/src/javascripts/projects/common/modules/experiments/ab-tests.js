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
import { articlesViewedBannerUkElection } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-uk-election';
import { contributionsBannerUsEoyReaderAppreciationNonsupportersCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy-reader-appreciation-nonsupporters-casuals';
import { contributionsBannerUsEoyReaderAppreciationSupportersCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy-reader-appreciation-supporters-casuals';
import { contributionsBannerUsEoyReaderAppreciationNonsupporters } from 'common/modules/experiments/tests/contribs-banner-us-eoy-reader-appreciation-nonsupporters';
import { contributionsBannerUsEoyReaderAppreciationSupporters } from 'common/modules/experiments/tests/contribs-banner-us-eoy-reader-appreciation-supporters';
import { contributionsBannerUsEoyImpeachmentCasuals } from 'common/modules/experiments/tests/contribs-banner-us-eoy-impeachment-casuals';
import { contributionsBannerUsEoyImpeachmentRegulars } from 'common/modules/experiments/tests/contribs-banner-us-eoy-impeachment-regulars';

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
    contributionsBannerUsEoyImpeachmentRegulars,
    contributionsBannerUsEoyImpeachmentCasuals,
    contributionsBannerUsEoyReaderAppreciationSupporters,
    contributionsBannerUsEoyReaderAppreciationNonsupporters,
    contributionsBannerUsEoyReaderAppreciationSupportersCasuals,
    contributionsBannerUsEoyReaderAppreciationNonsupportersCasuals,
    articlesViewedBannerUkElection,
    articlesViewedBanner,
];
