define(['common', 'bean', 'modules/analytics/canary'], function(common, bean, Canary) {

    describe("Canary", function() {
       
        var e,
            p = '/uk/2012/oct/15/mod-military-arms-firms',
            w = {},
            fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' };
        
        it("should exist", function(){
            e = new Canary({window: w});
            expect(e).toBeDefined();
        });

    })
});
