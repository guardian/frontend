define(['modules/experiments/ab', '../fixtures/ab-test'], function(AB, Test) {

    describe('AB Testing', function() {

        var test,
            controlSpy,
            variantSpy,
            participationsKey = 'gu.ab.participations';

        beforeEach(function() {
            AB.clearTests();
            test = new Test(),
            controlSpy = sinon.spy(test.variants[0], 'test'),
            variantSpy = sinon.spy(test.variants[1], 'test');
            // add a test
            AB.addTest(test);
        });

        afterEach(function() {
            AB.clearTests();
            localStorage.removeItem(participationsKey);
        });

        it('should exist', function() {
            // basic, check it exists
            expect(AB).toBeDefined();
        });

        it('should be able to start test', function() {
            AB.init({ switches: {'abDummyTest': true} }, document);
            expect(controlSpy.called || variantSpy.called).toBeTruthy();
        });

        it('should allow forcing of test via url', function() {
            AB.init({
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

            AB.init({
                switches: {
                    abDummyTest: true
                }
            });
            expect(controlSpy).toHaveBeenCalled();
        });

        it('should store all the tests user is in', function() {
            var otherTest = new Test();
            otherTest.id = 'DummyTest2';
            AB.addTest(otherTest);

            AB.init({
                switches: {
                    abDummyTest: true,
                    abDummyTest2: true,
                }
            });
            var storedParticipated = JSON.parse(localStorage.getItem(participationsKey)).value;
            expect(storedParticipated.DummyTest.variant).not.toBeUndefined();
            expect(storedParticipated.DummyTest2.variant).not.toBeUndefined();
        });

        it('should not run if switch is off', function() {
            AB.init({
                switches: {
                    abDummyTest: false,
                }
            });
            expect(controlSpy.called || variantSpy.called).toBeFalsy();
        });

    });

});