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

    var ContributionsEpicRegulars = {
        name: 'ContributionsEpicRegulars',
        variants: ['control', 'fairness_mild', 'fairness_strong', 'fairness_strong_alternate_hook', 'reliance']
	};

    var AcquisitionsEpicDesignVariations = {
        name: 'AcquisitionsDesignVariations',
        variants: ['control', 'extra_paragraph', 'large_hook', 'subtle', 'prominent', 'highlight']
    };

    var AcquisitionsEpicArticle50Trigger = {
        name: 'AcquisitionsEpicArticle50Trigger',
        variants: ['control']
    };

    var contributionsTests = [
        ContributionsEpicAlwaysAskStrategy,
        ContributionsEpicBrexit,
        ContributionsEpicAskFourStagger,
        ContributionsEpicAskFourEarning,
        ContributionsEpicRegulars,
        AcquisitionsEpicDesignVariations,
        AcquisitionsEpicArticle50Trigger
    ];

    var emailTests = [];

    var nonEmailClashingTests = contributionsTests;

    var clashingTests = contributionsTests.concat(emailTests);

    function userIsInAClashingAbTest(tests) {
        tests = tests || clashingTests;

        return _testABClash(ab.isInVariant, tests);
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
        nonEmailClashingTests: nonEmailClashingTests,
        _testABClash: _testABClash // exposed for unit testing
    };
});
