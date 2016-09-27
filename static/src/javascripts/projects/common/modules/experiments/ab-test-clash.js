define([
    'lodash/collections/some',
    'common/modules/experiments/ab'
], function (
    some,
    ab
) {

    function userIsInAClashingAbTest() {
        return _testABClash(ab.isInVariant);
    }

    function _testABClash(f) {

        var contributionsEpic = {name: 'ContributionsEpic20160916', variants: ['control', 'give', 'today', 'make']};
        var contributionsStory = {name: 'ContributionsStory20160922', variants: ['control', 'story']};
        var clashingTests = [contributionsEpic, contributionsStory];

        return some(clashingTests, function (test) {
            return some(test.variants, function (variant) {
                return f(test.name, variant);
            });
        });
    }

    return {
        userIsInAClashingAbTest: userIsInAClashingAbTest,
        _testABClash: _testABClash // exposed for unit testing
    };
});
