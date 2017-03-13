define([
    'common/modules/experiments/segment-util',
    'common/modules/experiments/test-can-run-checks',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/contributions-epic-ask-four-stagger',
    'common/modules/experiments/tests/contributions-epic-ask-four-earning',
    'common/modules/experiments/tests/contributions-epic-regulars',
    'common/modules/experiments/tests/acquisitions-epic-design-variations'
], function (
    segmentUtil,
    canRunChecks,
    viewLog,
    brexit,
    alwaysAsk,
    askFourStagger,
    askFourEarning,
    regulars,
    acquisitionsEpicDesignVariations
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [
        alwaysAsk,
		regulars,
        acquisitionsEpicDesignVariations,
        askFourEarning,
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

                return forced || (canRunChecks.testCanBeRun(t) && segmentUtil.isInTest(t) && hasNotReachedRateLimit);
            });

            return eligibleTests[0] && new eligibleTests[0]();
        }
    }
});
