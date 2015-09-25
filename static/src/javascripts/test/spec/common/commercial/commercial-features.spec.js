import Injector from 'helpers/injector';

const injector = new Injector();

describe('Commercial features', ()=> {
    let commercialFeatures, commercialFeaturePolicies, mockPolicySwitches;

    beforeEach(done => {
        injector.test([
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

    it('Allows a policy to set a switch if nothing else defines it', ()=> {
        mockPolicySwitches.policyOne = {};
        mockPolicySwitches.policyTwo = {foo : true};
        mockPolicySwitches.policyThree = {bar : false};

        const switches = commercialFeatures._init();
        expect(switches.foo).toBe(true);
        expect(switches.bar).toBe(false);
    });

    it('Allows a policy to veto a switch even if everything else enables it', ()=> {
        mockPolicySwitches.policyOne = {foo: true};
        mockPolicySwitches.policyTwo = {foo : false};
        mockPolicySwitches.policyThree = {foo: true};

        const switches = commercialFeatures._init();
        expect(switches.foo).toBe(false);
    });
});

