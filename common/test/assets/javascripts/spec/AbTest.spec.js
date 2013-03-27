define(['modules/ab-test'], function(abTest) {
    
    describe('AB Test', function() {

        beforeEach(function() {
        });

        afterEach(function() {
        });

        it('should exist', function() {
            // basic, check it exists
            expect(abTest).toBeDefined();
        });

        it('should be able to add and retrieve a test', function() {
            var testName = 'A Test',
                variants = {
                    variantOne: function() {}
                };
            // add test
            expect(abTest.add(testName, variants)).toBe(abTest);
            // retrieve it
            expect(abTest.get(testName)).toBe(variants);
        });

        it('should be able to start test', function() {
            var testName = 'A Test';
            // start test
            abTest.start(testName);
        });
        
    });

});