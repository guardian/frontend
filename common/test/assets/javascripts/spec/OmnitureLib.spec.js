define(['analytics/omniture', 'common'], function(Omniture, common) {
    
    describe("Omniture", function() { 

        var config = {};

        beforeEach(function(){
            config.page = { omnitureAccount: 'the_account' }
        });

        it("should load the omniture 's' object", function(){
            var o = new Omniture(null, config).init();
            waits(100); 
            runs(function() {
                expect(s_d).toBeDefined();
                expect(s.t).toBeDefined();
            });

        });

    });


});

