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

        it('should put all non-participating users in control group', function() {
            test.audience = 0;

            ab.init({
                switches: {
                    abDummyTest: true
                }
            });
            expect(controlSpy).toHaveBeenCalled();
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
                    abDummyTest2: true,
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

    });

});
