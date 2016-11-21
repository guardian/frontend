define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    var contributionsEpicFakeNews = {
        name: 'ContributionsEpicFakeNews',
        variants: ['control', 'fake']
    };

    var contributionsEpicThankyou = {
        name: 'ContributionsEpicThankYou',
        variants: ['control']
    };

    var contributionsEpicUsaCtaFakeNews = {
        name: 'ContributionsEpicUsaCtaFakeNews',
        variants: ['mixed-control', 'mixed-fake', 'just-contribute-control', 'just-contribute-fake']
    };

    function userIsInAClashingAbTest() {
        var clashingTests = [contributionsEpicFakeNews, contributionsEpicThankyou, contributionsEpicUsaCtaFakeNews];
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
