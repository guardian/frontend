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

    var AcquisitionsEpicDesignVariationsV2 = {
        name: 'AcquisitionsEpicDesignVariationsV2',
        variants: ['control', 'highlight_subtle', 'highlight_perspective', 'highlight_secure', 'highlight_hard', 'paypal']
    };

    var AcquisitionsEpicArticle50Trigger = {
        name: 'AcquisitionsEpicArticle50Trigger',
        variants: ['control']
    };

    var ContributionsEpicLaundromat = {
        name: 'ContributionsEpicLaundromat',
        variants: ['control']
    };


    var AcquisitionsContentTailoringEnvironment = {
        name: 'AcquisitionsEpicContentTailoringEnvironment',
        variants: ['control', 'impact', 'reference']
    };

    var AcquisitionsContentTailoringCif = {
        name: 'AcquisitionsEpicContentTailoringCif',
        variants: ['control', 'impact', 'reference']
    };

    var AcquisitionsContentTailoringFootball = {
        name: 'AcquisitionsEpicContentTailoringFootball',
        variants: ['control', 'impact', 'reference']
    };

    var contributionsTests = [
        ContributionsEpicAlwaysAskStrategy,
        ContributionsEpicBrexit,
        ContributionsEpicAskFourEarning,
        ContributionsEpicRegularsV2,
        AcquisitionsEpicDesignVariationsV2,
        AcquisitionsEpicArticle50Trigger,
        AcquisitionsContentTailoringEnvironment,
        AcquisitionsContentTailoringCif,
        AcquisitionsContentTailoringFootball
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
