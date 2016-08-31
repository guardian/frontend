define([
    'common/modules/experiments/ab-test-clash'
], function (
    Clash
) {
        describe('Clash', function () {

            it('test clash should be true with true function', function () {
                var f = function () { return true; };
                expect(Clash._testABClash(f)).toBeTruthy();
            });

            it('test clash should be false with false function', function () {
                var f = function () { return false; };
                expect(Clash._testABClash(f)).toBeFalsy();
            });
        });
});
