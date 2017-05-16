define([
    'lodash/collections/reduce',
    'common/modules/experiments/segment-util',
    'common/modules/experiments/test-can-run-checks',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/contributions-epic-ask-four-earning',
    'common/modules/experiments/tests/acquisitions-epic-liveblog',
    'common/modules/experiments/tests/acquisitions-epic-testimonials-round-two',
    'common/modules/experiments/tests/acquisitions-epic-single-cta'

], function (
    reduce,
    segmentUtil,
    testCanRunChecks,
    viewLog,
    alwaysAsk,
    askFourEarning,
    acquisitionsEpicLiveBlog,
    acquisitionsEpicTestimonialsRoundTwo,
    acquisitionsEpicSingleCta
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [
        alwaysAsk,
        acquisitionsEpicSingleCta,
        acquisitionsEpicTestimonialsRoundTwo,
        askFourEarning,
        acquisitionsEpicLiveBlog
    ];

    var epicEngagementBannerTests = reduce(tests, function(out, test) {
        var testInstance = new test();
        if (testInstance.isEngagementBannerTest) {
            out.push(testInstance)
        }
        return out;
    }, []);

    var abTestClashData = tests.map(function(test) {
        return new test();
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
