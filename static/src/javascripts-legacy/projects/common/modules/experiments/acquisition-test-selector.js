define([
    'common/modules/experiments/segment-util',
    'common/modules/experiments/tests/contributions-epic-brexit',
    'common/modules/experiments/tests/contributions-epic-always-ask-strategy',
], function (
    segmentUtil,
    brexit,
    alwaysAsk
) {
    /**
     * acquisition tests in priority order (highest to lowest)
     */
    var tests = [alwaysAsk, brexit];

    return {
        getTest: function() {
            var eligibleTests = tests.filter(function (test) {
                var t = new test();
                var forced = new RegExp('^#ab-' + t.id).test(window.location.hash);

                return forced || (t.canRun() && segmentUtil.isInTest(t));
            });

            return eligibleTests && new eligibleTests[0]();
        }
    }
});
