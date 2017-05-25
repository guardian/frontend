define([
    'helpers/injector'
], function (
    Injector
) {
        describe('Clash', function () {
            var Clash,
                sandbox;

            beforeEach(function (done) {
                var injector = new Injector();

                sandbox = sinon.sandbox.create();
                injector.require([
                    'common/modules/experiments/ab-test-clash'
                ], function (sut) {
                    Clash = sut;

                    done();
                });
            });

            afterEach(function () {
                sandbox.restore();
            });

            it('test clash should return false if test has only outbrain compliant variant', function () {
                var f = sandbox.spy();
                var test = {
                    id: 'outbrainCompliantTest',
                    variants: [{
                        id: 'control',
                        options: {
                            isOutbrainCompliant: true
                        }
                    }]
                };
                var clashingTests = [test];

                expect(Clash._testABClash(f, clashingTests)).toBeFalsy();
                expect(f).not.toHaveBeenCalled();
            });

            it('test clash should return true if test has outbrain non compliant variant and f returns true', function () {
                var f = sandbox.stub().returns(true);
                var test = {
                    id: 'outbrainCompliantTest',
                    variants: [{
                        id: 'control',
                        options: {
                            isOutbrainCompliant: true
                        }
                    }, {
                        id: 'variant',
                        options: {
                            isOutbrainCompliant: false
                        }
                    }]
                };
                var clashingTests = [test];

                expect(Clash._testABClash(f, clashingTests)).toBeTruthy();
                expect(f).toHaveBeenCalledOnce();
                expect(f).toHaveBeenCalledWith(test, test.variants[1]);

            });

            it('test clash should return false if test has outbrain non compliant variant and f returns true', function () {
                var f = sandbox.stub().returns(false);
                var test = {
                    id: 'outbrainCompliantTest',
                    variants: [{
                        id: 'control',
                        options: {
                            isOutbrainCompliant: true
                        }
                    }, {
                        id: 'variant',
                        options: {
                            isOutbrainCompliant: false
                        }
                    }]
                };
                var clashingTests = [test];

                expect(Clash._testABClash(f, clashingTests)).toBeFalsy();
                expect(f).toHaveBeenCalledOnce();
                expect(f).toHaveBeenCalledWith(test, test.variants[1]);
            });
        });
});
