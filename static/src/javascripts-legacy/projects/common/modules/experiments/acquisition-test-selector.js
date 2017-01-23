define([
    'common/modules/experiments/segment-util',
    'common/modules/commercial/acquisitions-view-log',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
    'common/modules/experiments/tests/contributions-ask4-stagger'
], function (
    segmentUtil,
    viewLog,
    brexit,
    alwaysAsk,
    ask4Stagger
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [ask4Stagger, alwaysAsk, brexit];

    return {
        getTest: function() {
            var eligibleTests = tests.filter(function (test) {
                var t = new test();
                var forced = window.location.hash.indexOf('ab-' + t.id) > -1;
                var variant = segmentUtil.variantFor(t);
                var acceptableViewCount =
                    variant? viewLog.viewsInPreviousDays(variant.maxViews.days, t) <= variant.maxViews.count && viewLog.viewsInPreviousDays(variant.maxViews.minDaysBetweenViews, t) === 0 : false;


                return forced || (t.canRun() && segmentUtil.isInTest(t) && acceptableViewCount);
            });

            return eligibleTests[0] && new eligibleTests[0]();
        }
    }
});
