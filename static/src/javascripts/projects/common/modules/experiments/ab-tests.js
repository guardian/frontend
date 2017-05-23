// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import {
    getTest as getAcquisitionTest,
} from 'common/modules/experiments/acquisition-test-selector';
import OpinionEmailVariants
    from 'common/modules/experiments/tests/opinion-email-variants';
import MembershipEngagementBannerTests
    from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import PaidContentVsOutbrain2
    from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import { tailorSurvey } from 'common/modules/experiments/tests/tailor-survey';
import TheLongReadEmailVariants
    from 'common/modules/experiments/tests/the-long-read-email-variants';
import FashionStatementEmailVariants
    from 'common/modules/experiments/tests/fashion-statement-email-variants';
import BookmarksEmailVariants2
    from 'common/modules/experiments/tests/bookmarks-email-variants-2';
import FilmTodayEmailVariants
    from 'common/modules/experiments/tests/film-today-email-variants';
import SleevenotesNewEmailVariant
    from 'common/modules/experiments/tests/sleeve-notes-new-email-variant';
import SleevenotesLegacyEmailVariant
    from 'common/modules/experiments/tests/sleeve-notes-legacy-email-variant';
import IncreaseInlineAdsRedux
    from 'common/modules/experiments/tests/increase-inline-ads';
import PaidCommenting from 'common/modules/experiments/tests/paid-commenting';
import BundleDigitalSubPriceTest1
    from 'common/modules/experiments/tests/bundle-digital-sub-price-test-1';
import {
    ExplainerSnippet,
} from 'common/modules/experiments/tests/explainer-snippet';
import {
    MeasureUnderstanding,
} from 'common/modules/experiments/tests/measure-understanding';

export const TESTS: Array<ABTest> = [
    new OpinionEmailVariants(),
    new PaidContentVsOutbrain2(),
    getAcquisitionTest(),
    tailorSurvey,
    TheLongReadEmailVariants,
    FashionStatementEmailVariants,
    BookmarksEmailVariants2,
    FilmTodayEmailVariants,
    SleevenotesNewEmailVariant,
    SleevenotesLegacyEmailVariant,
    new IncreaseInlineAdsRedux(),
    new PaidCommenting(),
    new BundleDigitalSubPriceTest1(),
    ExplainerSnippet(),
    MeasureUnderstanding(),
]
    .concat(MembershipEngagementBannerTests)
    .filter(Boolean);

export const getActiveTests = (): Array<ABTest> =>
    TESTS.filter(test => {
        if (isExpired(test.expiry)) {
            removeParticipation(test);
            return false;
        }
        return true;
    });

export const getExpiredTests = (): Array<ABTest> =>
    TESTS.filter(test => isExpired(test.expiry));

export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};
