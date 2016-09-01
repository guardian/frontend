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

        var contributionsArticle = {
            name: 'ContributionsArticle20160822',
            variants: ['about', 'pockets', 'like', 'love', 'truth']
        };

        var contributionsEmbed = {name: 'ContributionsEmbed20160823', variants: ['control', 'interactive']};

        var contributionsUserTesting = {name: 'ContributionsUserTesting20160831', variants: ['control']};

        var clashingTests = [contributionsArticle, contributionsEmbed, contributionsUserTesting];

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
