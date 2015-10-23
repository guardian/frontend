define(['helpers/injector'], function (Injector) {
    var injector = new Injector();

    describe('Commercial features', function () {
        var commercialFeatures, commercialFeaturePolicies, mockPolicySwitches;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/commercial-features',
                'common/modules/commercial/commercial-feature-policies'
            ], function () {
                commercialFeatures = arguments[0];
                commercialFeaturePolicies = arguments[1];
                commercialFeaturePolicies.getPolicySwitches = function getMockPolicySwitches() {
                    return mockPolicySwitches;
                };
                done();
            });
            mockPolicySwitches = {};
        });

        it('Allows a policy to set a switch if nothing else defines it', function () {
            mockPolicySwitches.policyOne = {};
            mockPolicySwitches.policyTwo = {foo : true};
            mockPolicySwitches.policyThree = {bar : false};

            var switches = commercialFeatures.reset();
            expect(switches.foo).toBe(true);
            expect(switches.bar).toBe(false);
        });

        it('Allows a policy to veto a switch even if everything else enables it', function () {
            mockPolicySwitches.policyOne = {foo: true};
            mockPolicySwitches.policyTwo = {foo : false};
            mockPolicySwitches.policyThree = {foo: true};

            var switches = commercialFeatures.reset();
            expect(switches.foo).toBe(false);
        });
    });
});
