define([
    'common/modules/experiments/ab',
    'common/$',
    'modules/abtests/participation'
], function(
    abTests,
    $,
    Participation
) {
    function initialise() {
        var participations = abTests.getParticipations();
        var elem = $('.participations');

        if (elem) {
            Object.keys(participations).forEach(function(test, index) {
                var p = new Participation({ test: test, variant: participations[test].variant });
                p.render(elem);
            });
        }
    }

    return {
        init: initialise
    };
});
