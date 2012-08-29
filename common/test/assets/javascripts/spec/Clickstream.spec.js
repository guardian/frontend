define(['analytics/clickstream', 'vendor/bean-0.4.11-1', 'common'], function(Clickstream, bean, common) {

    describe("Clickstream", function() { 

        bean.add(document.getElementById('click-me'), 'click', function(e) {
            e.preventDefault();
           })

        it("should record clicks with correct analytics name", function(){
        
            var cs  = new Clickstream(),
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

        xit("should not wait to record clicks for ajax links", function(){
        });

        xit("should not record clicks against an element not inside an <a> tag", function(){
        
        });
    
    });

});

