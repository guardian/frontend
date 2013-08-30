define(['common', 'bean', 'modules/analytics/canary'], function(common, bean, Canary) {

    describe("Canary", function() {

        var w = {};

        beforeEach(function(){
            common.$g('#js-canary').remove();
        })

        afterEach(function(){
            // clean listeners
            common.mediator.removeEvent('module:clickstream:click');
        })

        it("should exist", function(){
            var c = new Canary({window: w});
            expect(c).toBeDefined();
        });

        it("should log interactions with features we want to track", function(){
            var c = new Canary({ sample: 1 });
            c.init();
            common.mediator.emit('module:clickstream:click', 'Article | global navigation: header | sections | Culture')
            expect(document.querySelector('#js-canary').getAttribute('src')).toContain('px.gif?canary/navigation');
        });

        it("should ignore interactions that we don't want to track", function(){
            var c = new Canary({ sample: 1 });
            c.init();
            common.mediator.emit('module:clickstream:click', 'Unknown | clickstream | event')
            expect(document.querySelectorAll('#js-canary').length).toBe(0);
        });

    })
});
