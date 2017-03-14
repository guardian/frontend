define([
    'common/modules/experiments/segment-util',
    'common/modules/experiments/test-can-run-checks',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/contributions-epic-ask-four-stagger',
    'common/modules/experiments/tests/contributions-epic-ask-four-earning',
    'common/modules/experiments/tests/contributions-epic-regulars',
    'common/modules/experiments/tests/acquisitions-epic-design-variations',
    'common/modules/experiments/tests/acquisitions-epic-article-50-trigger'
], function (
    segmentUtil,
    testCanRunChecks,
    viewLog,
    brexit,
    alwaysAsk,
    askFourStagger,
    askFourEarning,
    regulars,
    acquisitionsEpicDesignVariations,
    acquisitionsEpicArticle50Trigger
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [
        alwaysAsk,
		regulars,
        acquisitionsEpicDesignVariations,
        askFourEarning,
        acquisitionsEpicArticle50Trigger,
        brexit,
        askFourStagger
    ];

    return {
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
