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
        
        var contributionsEmbed = {name: 'ContributionsEmbed20160905', variants: ['control']};

        var contributionsEpic = {name: 'ContributionsEpic20160906', variants: ['control']};

        var contributionsEpicButtons = {name: 'ContributionsEpicButtons20160907', variants: ['control', 'buttons']};
        
        var clashingTests = [contributionsEmbed, contributionsEpic, contributionsEpicButtons];

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
