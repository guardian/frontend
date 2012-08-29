define(['analytics/clickstream', 'vendor/bean-0.4.11-1', 'common'], function(Clickstream, bean, common) {

    describe("Clickstream", function() { 

        beforeEach(function(){

            // prevents unit tests from visiting the link
            bean.add(document.getElementById('click-me'), 'click', function(e) {
                e.preventDefault();
            })

            common.mediator.removeAllListeners();

        });

        it("should derive analytics tag name from the dom ancestors of the source element", function(){
        
            var cs  = new Clickstream({ filter: ["a"] }),
                object = { method: function (tag) {} },
                spy = sinon.spy(object, "method");
             
            spy.withArgs('outer div | the link');

            common.mediator.on('clickstream:click', spy);

            bean.fire(document.getElementById('click-me'), 'click');
    
            waits(10);

            runs(function(){
                expect(spy.withArgs('outer div | the link')).toHaveBeenCalledOnce();
            });
            
        });

        it("should ignore click not from a list of given element sources", function(){
            
            var cs  = new Clickstream({ filter: ['a'] }), // only log events on [a]nchor elements
                object = { method: function (tag) {} },
                spy = sinon.spy(object, "method");

            common.mediator.on('clickstream:click', spy);
            
            bean.fire(document.getElementById('not-inside-a-link'), 'click');
            
            waits(10);

            runs(function(){
                expect(spy.callCount).toBe(0);
            });

        });
    
    });

});

