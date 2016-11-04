define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    function userIsInAClashingAbTest() {

        var contributionsCountriesUk = {
            name: 'ContributionsCountriesUk',
            variants: ['control', 'global', 'democracy']
        };

        var contributionsCountriesAmerica = {
            name: 'ContributionsCountriesAmerica',
            variants: ['control', 'global', 'democracy']
        };

        var contributionsMembershipEpic = {
            name: 'ContributionsMembershipEpicBrexit',
            variants: ['control', 'member-contribute']
        };


        var clashingTests = [contributionsCountriesUk, contributionsCountriesAmerica, contributionsMembershipEpic];
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
