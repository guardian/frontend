define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    var contributionsEpicPostElectionCopyTest = {
        name: 'ContributionsEpicPostElectionCopyTestTwo',
        variants: ['control', 'v1', 'v2']
    };

    var contributionsEpicThankyou = {
        name: 'ContributionsEpicThankYou',
        variants: ['control']
    };

    function userIsInAClashingAbTest() {
        var clashingTests = [contributionsEpicPostElectionCopyTest, contributionsEpicThankyou];
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
