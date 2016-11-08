define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    function userIsInAClashingAbTest() {

        var contributionsMembershipEpicCtaUnitedStatesTwo = {
            name: 'ContributionsMembershipEpicCtaUnitedStatesTwo',
            variants: ['control', 'membership', 'equal']
        };

        var contributionsMembershipEpicCtaRestOfWorldTwo = {
            name: 'ContributionsMembershipEpicCtaRestOfWorldTwo',
            variants: ['control', 'membership', 'equal']
        };


        var clashingTests = [contributionsMembershipEpicCtaUnitedStatesTwo, contributionsMembershipEpicCtaRestOfWorldTwo];
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
