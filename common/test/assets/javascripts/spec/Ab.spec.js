define(['modules/experiments/ab', '../fixtures/ab-test'], function(ab, ABTest) {

    describe('AB Testing', function() {

        var test,
            controlSpy,
            variantSpy,
            participationsKey = 'gu.ab.participations';

        beforeEach(function() {
            
            ab.clearTests();

            // a list of ab-tests that can be used in the spec's 
            test = {
                one: new ABTest('DummyTest'),
                two: new ABTest('DummyTest2')
            }
             
            switches = {
                test_one_off: { switches: { abDummyTest: false }},
                test_one_on: { switches: { abDummyTest: true }},
                both_tests_on: { switches: { abDummyTest: true, abDummyTest2: true }}
            }

            controlSpy = sinon.spy(test.one.variants[0], 'test'),
            variantSpy = sinon.spy(test.one.variants[1], 'test');
            
            ab.addTest(test.one);
        });

        afterEach(function() {
            ab.clearTests();
            localStorage.removeItem(participationsKey);
            document.body.removeAttribute('data-link-test');
        });

        describe("Ab", function () {
        
            it('should exist', function() {
                expect(ab).toBeDefined();
            });
        
        });

        describe("User segmentation", function () {
            
            it('should not run if switch is off', function() {
                ab.segment(switches.test_one_off);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });
            
            it('should segment the user in to a test', function() {
                
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                
                var storedParticipated = JSON.parse(localStorage.getItem(participationsKey)).value;
                expect(storedParticipated.DummyTest.variant).not.toBeUndefined();
                expect(storedParticipated.DummyTest2.variant).not.toBeUndefined();
            });
            
            it('should put all non-participating users in a "not in test" group', function() {
                test.one.audience = 0;
                ab.segment(switches.test_one_on);
                expect(controlSpy).not.toHaveBeenCalled();
                var storedParticipated = JSON.parse(localStorage.getItem(participationsKey)).value;
                expect(storedParticipated.DummyTest.variant).toBe("notintest");
            });
            
            it("should not segment user if test can't be run", function() {
                test.one.canRun = function() { return false; }
                ab.segment(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
                expect(ab.getParticipations()).toEqual([]);
            });


            it('should get all the tests user is in', function() {
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                var tests = Object.keys(ab.getParticipations()).map(function(k){
                    return k; }).toString()
                expect(tests).toBe('DummyTest,DummyTest2');
                
            });
            
            it('should remove expired tests from being logged', function () {
                localStorage.setItem(participationsKey, '{"value":{"DummyTest":{"variant":"null"}}}');
                test.one.expiry = "2012-01-01";
                ab.segment(switches.test_one_on);
                expect(localStorage.getItem(participationsKey)).toBe('{"value":{}}');
            });

        });
    
        describe("Running tests", function () {
            
            it('should be able to start test', function() {
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });

            it('should not run the test if the user has not been put in a segment', function () {
                // Nb. no call to ab.segment(...)
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should refuse to run the after the expiry date', function () {
                test.one.expiry = "2012-01-01";
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should run the test if it has not expired', function () {
                var futureDate = new Date();
                futureDate.setHours(futureDate.getHours() + 10);
                test.expiry = futureDate.toString();
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });
            
        });

        describe("Analytics", function () {
            
            it('should add "data-link-test" tracking to body', function() {
                ab.segment(switches.test_one_on);
                ab.run(switches.test_one_on);
                expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide)$/);
            });

            it('should concat "data-link-test" tracking when more than one test', function() {
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide), AB \| DummyTest2 test \| (control|hide)$/);
            });
            
            it('should generate a string for Omniture to tag the test(s) the user is in', function() {
                Math.seedrandom('gu');
                test.two.audience = 1; 
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(ab.makeOmnitureTag(switches.both_tests_on)).toBe("AB | DummyTest | control,AB | DummyTest2 | control");
        
            });
            
            it('should not generate Omniture tags when a test can not be run', function() {
                test.two.canRun = function() { return false; }
                ab.addTest(test.two);
                ab.segment(switches.both_tests_on);
                ab.run(switches.both_tests_on);
                expect(ab.makeOmnitureTag(switches.both_tests_on)).toBe("AB | DummyTest | control");
            });
        
        });

    });
});
