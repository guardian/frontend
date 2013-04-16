define(['modules/experiments/ab', '../fixtures/ab-test'], function(AB, Test) {
    
    describe('AB Testing', function() {

        beforeEach(function() {
        });

        afterEach(function() {
        });

        it('should exist', function() {
            // basic, check it exists
            expect(AB).toBeDefined();
        });

        describe("Test running", function() {

            it('should be able to add a test', function() {
                var newTest = AB.addTest(Test);

                // add test
                expect(newTest.id).toBe("DummyTest");
            });

            it('should be able to start test', function() {
                var newTest = AB.addTest(Test),
                    spy = sinon.spy(newTest.variants[0], "test");

                AB.runVariant(newTest, "control");

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

            it('Can store user participation', function(){
               AB.setParticipation("DummyTest");
               expect(AB.hasParticipated("DummyTest")).toBe(true);

            });

        });
        
    });

});