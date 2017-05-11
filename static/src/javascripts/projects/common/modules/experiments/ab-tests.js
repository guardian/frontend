// @flow
import type { ABTest } from 'common/modules/experiments/ab-types';

import * as testCanRunChecks
    from 'common/modules/experiments/test-can-run-checks';
import abUtils from 'common/modules/experiments/utils';

import acquisitionTestSelector
    from 'common/modules/experiments/acquisition-test-selector';
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

// this should be an Array<ABTest> but that
// needs all of the imported tests to be converted
export const TESTS = [
    new OpinionEmailVariants(),
    new PaidContentVsOutbrain2(),
    acquisitionTestSelector.getTest(),
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
]
    .concat(MembershipEngagementBannerTests)
    .filter(t => t !== undefined && t !== null);

export const getActiveTests = () =>
    TESTS.filter(test => {
        if (testCanRunChecks.isExpired(test.expiry)) {
            abUtils.removeParticipation(test);
            return false;
        }
        return true;
    });

export const getExpiredTests = () =>
    TESTS.filter(test => testCanRunChecks.isExpired(test.expiry));

export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};
