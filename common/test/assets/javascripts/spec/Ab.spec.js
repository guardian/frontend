define(['modules/experiments/ab', '../fixtures/ab-test'], function(ab, ABTest) {

    describe('AB Testing', function() {

        var test,
            controlSpy,
            variantSpy,
            participationsKey = 'gu.ab.participations';

        beforeEach(function() {
            ab.clearTests();
            test = new ABTest(),
            controlSpy = sinon.spy(test.variants[0], 'test'),
            variantSpy = sinon.spy(test.variants[1], 'test');
            // add a test
            ab.addTest(test);
        });

        afterEach(function() {
            ab.clearTests();
            localStorage.removeItem(participationsKey);
            // remove tracking from body
            document.body.removeAttribute('data-link-test');
        });

        describe("Ab", function () {
        
            it('should exist', function() {
                // basic, check it exists
                expect(ab).toBeDefined();
            });
        
        });

        describe("User segmentation", function () {
            
            it('should not run if switch is off', function() {
                ab.init({
                    switches: {
                        abDummyTest: false,
                    }
                });
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should put all non-participating users in a "not in test" group', function() {
                test.audience = 0;
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
                expect(controlSpy).not.toHaveBeenCalled();
                var storedParticipated = JSON.parse(localStorage.getItem(participationsKey)).value;
                expect(storedParticipated.DummyTest.variant).toBe("notintest");
            });
            
            it("should not segment user if test can't be run", function() {
                test.canRun = function() { return false; }
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
                expect(ab.getParticipations()).toEqual([]);
            });


            it('should store all the tests user is in', function() {
                var otherTest = new ABTest();
                otherTest.id = 'DummyTest2';
                ab.addTest(otherTest);

                ab.init({
                    switches: {
                        abDummyTest: true,
                        abDummyTest2: true,
                    }
                });
                var storedParticipated = JSON.parse(localStorage.getItem(participationsKey)).value;
                expect(storedParticipated.DummyTest.variant).not.toBeUndefined();
                expect(storedParticipated.DummyTest2.variant).not.toBeUndefined();
            });
            
            it('should get all the tests user is in', function() {
                var otherTest = new ABTest();
                otherTest.id = 'DummyTest2';
                ab.addTest(otherTest);

                ab.init({
                    switches: {
                        abDummyTest: true,
                        abDummyTest2: true
                    }
                });
            
                var tests = Object.keys(ab.getParticipations()).map(function(k){ return k; }).toString()
                expect(tests).toBe('DummyTest,DummyTest2');
                
            });
            
            it('should remove expired tests from being logged', function () {
                localStorage.setItem(participationsKey, '{"value":{"DummyTest":{"variant":"null"}}}');
                test.expiry = "2012-01-01";
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
                expect(localStorage.getItem(participationsKey)).toBe('{"value":{}}');
            });

        });
    
        describe("Running tests", function () {
            
            it('should be able to start test', function() {
                ab.init({ switches: {'abDummyTest': true} }, document);
                ab.run({ switches: {'abDummyTest': true} }, document);
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });

            it('should not run the test if the user has not been put in a segment', function () {
                // Nb. no call to ab.init(...)
                ab.run({ switches: { abDummyTest: true } });
                expect(controlSpy.called || variantSpy.called).toBeFalsy();
            });

            it('should refuse to run the after the expiry date', function () {
                test.expiry = "2012-01-01";
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
            });

            it('should run the test if it has not expired', function () {
                var futureDate = new Date();
                futureDate.setHours(futureDate.getHours() + 10);
                test.expiry = futureDate.toString();
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
                ab.run({ switches: { abDummyTest: true } });
                expect(controlSpy.called || variantSpy.called).toBeTruthy();
            });
            
        });

        describe("Analytics", function () {
            
            it('should add "data-link-test" tracking to body', function() {
                ab.init({
                    switches: {
                        abDummyTest: true
                    }
                });
                ab.run({ switches: {'abDummyTest': true} }, document);
                expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide)$/);
            });

            it('should concat "data-link-test" tracking when more than one test', function() {
                var otherTest = new ABTest();
                otherTest.id = 'DummyTest2';
                ab.addTest(otherTest);
                var s = {
                    abDummyTest: true,
                    abDummyTest2: true,
                    }
                ab.init({ switches: s });
                ab.run({ switches: s }, document);
                expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide), AB \| DummyTest2 test \| (control|hide)$/);
            });
            
            it('should generate a string for Omniture to tag the test(s) the user is in', function() {
                Math.seedrandom('gu');
                var otherTest = new ABTest()
                  , conf = { switches: { abDummyTest: true, abDummyTest2: true }};
                otherTest.id = 'DummyTest2';
                otherTest.audience = 1; 
                ab.addTest(otherTest);
                ab.init(conf);
                ab.run(conf, document);
                expect(ab.makeOmnitureTag(conf, document)).toBe("AB | DummyTest | control,AB | DummyTest2 | control");
        
            });
            
            it('should not generate Omniture tags when a test can not be run', function() {
                var otherTest = new ABTest()
                  , conf = { switches: { abDummyTest: true, abDummyTest2: true }};
                otherTest.id = 'DummyTest2';
                otherTest.canRun = function() { return false; }
                ab.addTest(otherTest);
                ab.init(conf);
                ab.run(conf, document);
                expect(ab.makeOmnitureTag(conf, document)).toBe("AB | DummyTest | control");
            });
        
        });

    });
});
