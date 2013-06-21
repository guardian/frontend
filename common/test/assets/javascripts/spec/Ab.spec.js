define(['modules/experiments/ab', '../fixtures/ab-test'], function(AB, Test) {

    describe('AB Testing', function() {

        var test;

        beforeEach(function() {
            // add a test
            test = AB.addTest(Test);
        });

        afterEach(function() {
        });

        it('should exist', function() {
            // basic, check it exists
            expect(AB).toBeDefined();
        });

        describe("Test running", function() {

            it('should be able to start test', function() {
                var spy = sinon.spy(test.variants[0], "test");

                AB.runVariant(test, "control");

                expect(spy).toHaveBeenCalled();
            });
        });

        describe("User test settings", function() {
            it('Can store and retrive user test settings', function() {
                AB.storeTest("DummyTest", "control");

                expect(AB.getTest().id).toBe("DummyTest");
                expect(AB.getTest().variant).toBe("control");
            });

            it('Can clear user test settings', function() {
               AB.clearTest();
               expect(AB.getTest()).toBe(false);
            });

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
            expect(AB.getTest().id).toBe('DummyTest');
            expect(AB.getTest().variant).toBe('hide');
        });

    });

});