define([
    'lodash/collections/reduce',
    'common/modules/experiments/segment-util',
    'common/modules/experiments/test-can-run-checks',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/epic-to-support-landing-page',
    'common/modules/experiments/tests/contributions-epic-ask-four-earning',
    'common/modules/experiments/tests/contributions-epic-regulars-v2',
    'common/modules/experiments/tests/acquisitions-epic-article-50-trigger',
    'common/modules/experiments/tests/acquisitions-epic-design-variations-v3',
    'common/modules/experiments/tests/contributions-epic-laundromat',
    'common/modules/experiments/tests/acquisitions-epic-vs-epic-and-engagement-banner'

], function (
    reduce,
    segmentUtil,
    testCanRunChecks,
    viewLog,
    brexit,
    alwaysAsk,
    epicToSupportLandingPage,
    askFourEarning,
    regularsV2,
    acquisitionsEpicArticle50Trigger,
    acquisitionsEpicDesignVariationsV3,
    laundromat,
    acquisitionsEpicVsEpicAndEngagementBanner

) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [
        alwaysAsk,
        laundromat,
		regularsV2,
        acquisitionsEpicDesignVariationsV3,
        acquisitionsEpicVsEpicAndEngagementBanner,
        epicToSupportLandingPage,
        askFourEarning,
        acquisitionsEpicArticle50Trigger,
        brexit
    ];

    var epicEngagementBannerTests = reduce(tests, function(out, test) {
        var testInstance = new test();
        if (testInstance.isEngagementBannerTest) {
            out.push(testInstance)
        }
        return out;
    }, []);

    var abTestClashData = tests.map(function(test) {
        var testInstance = new test();
        return {
            name: testInstance.id,
            variants: testInstance.variants.filter(function (variant) {
                return !variant.isOutbrainCompliant
            })
        }
    });

    return {

        epicEngagementBannerTests: epicEngagementBannerTests,

        abTestClashData: abTestClashData,

        getTest: function() {
            var eligibleTests = tests.filter(function (test) {
                var t = new test();
                var forced = window.location.hash.indexOf('ab-' + t.id) > -1;
                var variant = segmentUtil.variantFor(t);

                var hasNotReachedRateLimit = variant &&
                    ((viewLog.viewsInPreviousDays(variant.maxViews.days) < variant.maxViews.count &&
                    viewLog.viewsInPreviousDays(variant.maxViews.minDaysBetweenViews) === 0) ||
                    variant.isUnlimited);

                return forced || (testCanRunChecks.testCanBeRun(t) && segmentUtil.isInTest(t) && hasNotReachedRateLimit);
            });

            return eligibleTests[0] && new eligibleTests[0]();
        }
    }
});
