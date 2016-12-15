define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {


    var ContributionsEpicUsaCtaThreeWay = {
        name: 'ContributionsEpicUsaCtaThreeWay',
        variants: ['mixed', 'just-contribute', 'just-supporter']
    };

    var ContributionsEpicObserverAnniversary = {
        name: 'ContributionsEpicObserverAnniversary',
        variants: ['mixed']
    };

    var ContributionsEpicBrexitSupreme = {
        name: 'ContributionsEpicBrexitSupreme',
        variants: ['mixed']
    };

    var ContributionsEpicUsPreEndOfYearTwo = {
        name: 'ContributionsEpicUsPreEndOfYearTwo',
        variants: ['control', 'endOfYear']
    };

    var ContributionsEpicAlwaysAskStrategy = {
        name: 'ContributionsEpicAlwaysAskStrategy',
        variants: ['control', 'alwaysAsk']
    };

    var ContributionsEpicOnTheMoon = {
        name: 'ContributionsEpicOnTheMoon',
        variants: ['control', 'showMeTheMoon', 'australiaNewsroom', 'endOfYearAustralia']
    };

    function userIsInAClashingAbTest() {
        var clashingTests = [
            ContributionsEpicUsaCtaThreeWay,
            ContributionsEpicObserverAnniversary,
            ContributionsEpicBrexitSupreme,
            ContributionsEpicUsPreEndOfYearTwo,
            ContributionsEpicAlwaysAskStrategy,
            ContributionsEpicOnTheMoon
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
