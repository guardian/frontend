define(['common', 'bean', 'modules/analytics/canary'], function(common, bean, Canary) {

    describe("Canary", function() {
       
        var w = {};
        
        it("should exist", function(){
            var c = new Canary({window: w});
            expect(c).toBeDefined();
        });
        
        it("should log interactions with features", function(){
            var c = new Canary();
            c.init();
            common.mediator.emit('module:clickstream:click', 'Article | global navigation: header | sections | Culture')
            expect(document.querySelector('#js-canary').getAttribute('src')).toContain('px.gif?canary/navigation');
        });

    })
});
