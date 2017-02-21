define([
    'common/modules/experiments/ab-test-clash'
], function (
    Clash
) {
        describe('Clash', function () {

            var contributionsEpicButtons = {name: 'ContributionsEpicButtons20160907', variants: ['control', 'buttons']};
            var clashingTests = [contributionsEpicButtons];

            it('test clash should be true with true function', function () {
                var f = function () { return true; };
                expect(Clash._testABClash(f, clashingTests)).toBeTruthy();
            });

            it('test clash should be false with false function', function () {
                var f = function () { return false; };
                expect(Clash._testABClash(f, clashingTests)).toBeFalsy();
            });
        });
});
