define([
    'common/modules/experiments/segment-util',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/contributions-epic-ask-four-stagger',
    'common/modules/experiments/tests/contributions-epic-ask-four-earning',
    'common/modules/experiments/tests/contributions-epic-one-line-edits-v2',
    'common/modules/experiments/tests/acquisitions-love-boat'
], function (
    segmentUtil,
    viewLog,
    brexit,
    alwaysAsk,
    askFourStagger,
    askFourEarning,
    oneLineEditsV2,
    loveBoat
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */

    var tests = [alwaysAsk, loveBoat, oneLineEditsV2, askFourEarning, brexit, askFourStagger];

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

                return forced || (t.canRun() && segmentUtil.isInTest(t) && hasNotReachedRateLimit);
            });

            return eligibleTests[0] && new eligibleTests[0]();
        }
    }
});
