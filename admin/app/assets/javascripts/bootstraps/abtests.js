define([
    'common/modules/experiments/ab',
    'qwery',
    'modules/abtests/participation',
    'modules/abtests/breakdown'
], function(
    abTests,
    qwery,
    Participation,
    Breakdown
) {
    function renderParticipations() {
        var elem = qwery('.participation-section');

        if (elem) {
            var active = abTests.getActiveTests();

            active.forEach(function(test) {
                var participation = new Participation({ test: test});
                participation.render(elem);
            });
        }
    }

    function renderBreakdown() {
        var elem = qwery('.breakdown-section');

        if (elem) {
            var expired = abTests.getExpiredTests();
            var active = abTests.getActiveTests();

            var breakdown = new Breakdown({ active: active, expired: expired});
            breakdown.render(elem);
        }
    }

    function initialise() {
        renderBreakdown();
        renderParticipations();
    }

    return {
        init: initialise
    };
});
