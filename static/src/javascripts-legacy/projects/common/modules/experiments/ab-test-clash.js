define([
    'lodash/collections/some',
    'common/modules/experiments/ab',
    'common/modules/experiments/acquisition-test-selector'
], function (
    some,
    ab,
    acquisitionTestSelector
) {

    var emailTests = [];
    var contributionsTests = acquisitionTestSelector.abTestClashData;
    var clashingTests = contributionsTests.concat(emailTests);

    function userIsInAClashingAbTest(tests) {
        tests = tests || clashingTests;

        return _testABClash(ab.isInVariant, tests);
    }

    function _testABClash(f, clashingTests) {
        if (clashingTests.length > 0) {
            return some(clashingTests, function (test) {
                return some(test.variants, function (variant) {
                    return f(test, variant);
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
