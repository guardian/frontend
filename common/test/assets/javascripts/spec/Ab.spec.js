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

        it('should exist', function() {
            // basic, check it exists
            expect(ab).toBeDefined();
        });

        it('should be able to start test', function() {
            ab.init({ switches: {'abDummyTest': true} }, document);
            expect(controlSpy.called || variantSpy.called).toBeTruthy();
        });

        it('should allow forcing of test via url', function() {
            ab.init({
                switches: {
                    abDummyTest: true
                }
            },
            document,
            {
                test: {
                    id: 'DummyTest',
                    variant: 'hide'
                }
            });
            expect(variantSpy).toHaveBeenCalled();
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

        it('should not run if switch is off', function() {
            ab.init({
                switches: {
                    abDummyTest: false,
                }
            });
            expect(controlSpy.called || variantSpy.called).toBeFalsy();
        });

        it('should add "data-link-test" tracking to body', function() {
            ab.init({
                switches: {
                    abDummyTest: true
                }
            });
            expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide)$/);
        });

        it('should concat "data-link-test" tracking when more than one test', function() {
            var otherTest = new ABTest();
            otherTest.id = 'DummyTest2';
            ab.addTest(otherTest);

            ab.init({
                switches: {
                    abDummyTest: true,
                    abDummyTest2: true,
                }
            });
            expect(document.body.getAttribute('data-link-test')).toMatch(/^AB \| DummyTest test \| (control|hide), AB \| DummyTest2 test \| (control|hide)$/);
        });

        it('should not bucket user if test can\'t be run', function() {
            test.canRun = function() { return false; }
            ab.init({
                switches: {
                    abDummyTest: true
                }
            });
            expect(controlSpy.called || variantSpy.called).toBeFalsy();
            expect(ab.getParticipations()).toEqual([]);
        });

        it('should refuse to run the after the expiry date', function () {
            
            test.expiry = "2012-01-01";
            ab.init({
                switches: {
                    abDummyTest: true
                }
            });
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
        
        it('should run the test if it has not expired', function () {
            var futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 10);
            test.expiry = futureDate.toString();
            ab.init({
                switches: {
                    abDummyTest: true
                }
            });
            expect(controlSpy.called || variantSpy.called).toBeTruthy();
        });


    });

});
