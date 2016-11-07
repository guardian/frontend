define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    function userIsInAClashingAbTest() {

        var contributionsMembershipEpic = {
            name: 'ContributionsMembershipEpicBrexit',
            variants: ['control', 'member-contribute']
        };

        var contributionsMembershipEpicCtaUnitedStates = {
            name: 'ContributionsMembershipEpicCtaUnitedStates',
            variants: ['control', 'contributions2', 'contributions3', 'membership1', 'membership2', 'membership3', 'equal1', 'equal2', 'equal3']
        };


        var clashingTests = [contributionsMembershipEpic, contributionsMembershipEpicCtaUnitedStates];
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
