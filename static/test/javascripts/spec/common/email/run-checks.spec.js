define([
    'common/modules/email/run-checks'
], function (
    RunChecks
) {
        describe('RunChecks', function () {

            it('test clash should be true with true function', function () {
                var f = function () { return true; };
                expect(RunChecks._testABClash(f)).toBeTruthy();
            });

            it('test clash should be false with false function', function () {
                var f = function () { return false; };
                expect(RunChecks._testABClash(f)).toBeFalsy();
            });
        });
});
