define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {
    var ContributionsEpicAlwaysAskStrategy = {
        name: 'ContributionsEpicAlwaysAskStrategy',
        variants: ['alwaysAsk']
    };

    var ContributionsEpicOnTheMoon = {
        name: 'ContributionsEpicOnTheMoon',
        variants: ['control', 'showMeTheMoon', 'australiaNewsroom', 'endOfYearAustralia']
    };

    var ContributionsEpicUsEoyControl = {
        name: 'ContributionsEpicUsEoyControl',
        variants: ['control']
    };

    var ContributionsEpicUsEoyEndOfYear = {
        name: 'ContributionsEpicUsEoyEndOfYear',
        variants: ['endOfYear']
    };

    function userIsInAClashingAbTest() {
        var clashingTests = [
            ContributionsEpicOnTheMoon,
            ContributionsEpicAlwaysAskStrategy,
            ContributionsEpicUsEoyControl,
            ContributionsEpicUsEoyEndOfYear
        ];
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
