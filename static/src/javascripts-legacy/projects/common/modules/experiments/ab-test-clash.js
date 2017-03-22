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
    var ContributionsEpicAskFourEarning = {
        name: 'ContributionsEpicAskFourEarning',
        variants: ['control']
    };

    var ContributionsEpicRegularsV2 = {
        name: 'ContributionsEpicRegularsV2',
        variants: ['control', 'fairness_strong', 'fairness_strong_alternate_hook']
	};

    var AcquisitionsEpicDesignVariationsV3 = {
        name: 'AcquisitionsEpicDesignVariationsV3',
        // TODO
        variants: ['control', 'bigger_buttons', 'colour_change', 'paypal_and_credit_card']
    };

    var AcquisitionsEpicArticle50Trigger = {
        name: 'AcquisitionsEpicArticle50Trigger',
        variants: ['control']
    };

    var ContributionsEpicLaundromat = {
        name: 'ContributionsEpicLaundromat',
        variants: ['control']
    };

    var contributionsTests = [
        ContributionsEpicAlwaysAskStrategy,
        ContributionsEpicBrexit,
        ContributionsEpicAskFourEarning,
        ContributionsEpicRegularsV2,
        AcquisitionsEpicDesignVariationsV3,
        AcquisitionsEpicArticle50Trigger,
        ContributionsEpicLaundromat
    ];

    var emailTests = [];

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
        contributionsTests: contributionsTests,
        emailTests: emailTests,
        _testABClash: _testABClash // exposed for unit testing
    };
});
