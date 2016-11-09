define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    function userIsInAClashingAbTest() {

        var contributionsEpicPostElectionCopyTestUnitedStates = {
            name: 'ContributionsEpicPostElectionCopyTestUnitedStates',
            variants: ['contributionsControl', 'contributionsElection',
                'membershipControl', 'membershipElection',
                'equalControl', 'equalElection']
        };

        var contributionsEpicPostElectionCopyTestRestOfWorld = {
            name: 'ContributionsEpicPostElectionCopyTestRestOfWorld',
            variants: ['contributionsControl', 'contributionsElection',
                'membershipControl', 'membershipElection',
                'equalControl', 'equalElection']
        };


        var clashingTests = [contributionsEpicPostElectionCopyTestUnitedStates, contributionsEpicPostElectionCopyTestRestOfWorld];
        return _testABClash(ab.isInVariant, clashingTests);
    }

    function _testABClash(f, clashingTests) {
        if (clashingTests.length > 0) {
            return some(clashingTests, function (test) {
                return some(test.variants, function (variant) {
                    return f(test.name, variant);
                });
            });
        }
        else {
            return false;
        }
    }

    return {
        userIsInAClashingAbTest: userIsInAClashingAbTest,
        _testABClash: _testABClash // exposed for unit testing
    };
});
