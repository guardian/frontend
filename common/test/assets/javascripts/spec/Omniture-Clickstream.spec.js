define(['analytics/omniture', 'common'], function(Omniture, common) {
    
    describe("Omniture", function() { 

        var config, spy;

        beforeEach(function(){
            
            config = {
                page: {
                    omnitureAccount: 'the_account'
                }
            };
            
        });

        it("should log clickstream events", function() {

            var a = new Omniture(config).init();
            
            waitsFor(function() {
                return (window.s != null) // wait for the omniture object to be loaded
            });

            runs(function() {
                window.s = { tl: sinon.spy() }
                common.mediator.emit('modules:clickstream:click', [true, "foo"]);
                expect(s.tl).toHaveBeenCalledOnce();
            });
        });

    });

});

