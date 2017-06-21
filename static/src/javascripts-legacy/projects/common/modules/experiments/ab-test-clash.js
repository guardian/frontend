define(
    [
        'lodash/collections/some',
        'common/modules/experiments/utils',
        'common/modules/experiments/acquisition-test-selector',
    ],
    function(some, abUtils, acquisitionTestSelector) {
        var emailTests = [];
        var contributionsTests = acquisitionTestSelector.abTestClashData;
        var clashingTests = contributionsTests.concat(emailTests);

        function userIsInAClashingAbTest(tests) {
            tests = tests || clashingTests;

            return _testABClash(abUtils.isInVariant, tests);
        }

        function _testABClash(f, clashingTests) {
            if (clashingTests.length > 0) {
                return some(clashingTests, function(test) {
                    return test.variants
                        .filter(function(variant) {
                            var compliant =
                                variant &&
                                variant.options &&
                                variant.options.isOutbrainCompliant;
                            return !compliant;
                        })
                        .some(function(variant) {
                            return f(test, variant);
                        });
                });
            } else {
                return false;
            }
        }

        return {
            userIsInAClashingAbTest: userIsInAClashingAbTest,
            contributionsTests: contributionsTests,
            emailTests: emailTests,
            _testABClash: _testABClash, // exposed for unit testing
        };
    }
);
