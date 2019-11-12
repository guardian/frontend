// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { commercialCmpUiNonDismissable } from 'common/modules/experiments/tests/commercial-cmp-ui-non-dismissable';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { articlesViewed } from 'common/modules/experiments/tests/contributions-epic-articles-viewed';
import { articlesViewedMonthMomentFinal } from 'common/modules/experiments/tests/contributions-epic-articles-viewed-month-moment';
import { articlesViewed60DaysMomentFinal } from 'common/modules/experiments/tests/contributions-epic-articles-viewed-60-days-moment';
import { countryName } from 'common/modules/experiments/tests/contributions-epic-country-name';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { adblockTest } from 'common/modules/experiments/tests/adblock-ask';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { learnMore } from 'common/modules/experiments/tests/contributions-epic-learn-more-cta';
import { environmentMomentBannerFinalPush } from 'common/modules/experiments/tests/contributions-moment-banner-environment';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialCmpUiIab,
    adblockTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    commercialCmpUiNonDismissable,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    articlesViewedMonthMomentFinal,
    articlesViewed60DaysMomentFinal,
    articlesViewed,
    learnMore,
    countryName,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    articlesViewedBanner,
    environmentMomentBannerFinalPush,
];
