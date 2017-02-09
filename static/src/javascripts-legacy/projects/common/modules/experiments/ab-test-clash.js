define([
    'lodash/collections/some',
    'common/modules/experiments/ab',
    'common/utils/check-mediator'
], function (
    some,
    ab,
    checkMediator
) {
    var ContributionsEpicAlwaysAskStrategy = {
        name: 'ContributionsEpicAlwaysAskStrategy',
        variants: ['alwaysAsk']
    };
    var ContributionsEpicBrexit = {
        name: 'ContributionsEpicBrexit',
        variants: ['control']
    };
    var ContributionsEpicAskFourStagger = {
        name: 'ContributionsEpicAskFourStagger',
        variants: ['control', 'stagger_one_day', 'stagger_three_days']
    };
    var ContributionsEpicAskFourEarning = {
        name: 'ContributionsEpicAskFourEarning',
        variants: ['control']
    };

    function userIsInAClashingAbTest() {
        var clashingTests = [
            ContributionsEpicAlwaysAskStrategy,
            ContributionsEpicBrexit,
            ContributionsEpicAskFourStagger,
            ContributionsEpicAskFourEarning
        ];

        var isUserInAClashingAbTest = _testABClash(ab.isInVariant, clashingTests);

        checkMediator.resolveCheck('isUserInAClashingAbTest', isUserInAClashingAbTest);

        return isUserInAClashingAbTest;
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
