define([
    'common/modules/experiments/ab',
    'common/$',
    'modules/abtests/participation',
    'modules/abtests/breakdown'
], function(
    abTests,
    $,
    Participation,
    Breakdown
) {
    var participations = abTests.getParticipations();

    function renderParticipations() {
        var elem = $('.participation-section');

        if (elem) {
            var keys = Object.keys(participations);
            keys.forEach(function(test, index) {
                var participation = new Participation({ test: test, variant: participations[test].variant });
                participation.render(elem);
            });

            if (!keys.length) {
                elem.append("You have no participations in this browser.");
            }
        }
    }

    function renderBreakdown() {
        var elem = $('.breakdown-section');

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
