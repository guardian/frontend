define(['analytics/omniture', 'common'], function(Omniture, common) {
    
    describe("Omniture", function() { 

        var config = {};

        beforeEach(function(){
            config.page = { omnitureAccount: 'the_account' };
            config.switches = { optimizely: false };
        });

        it("should load the omniture 's' object", function(){
            var o = new Omniture().go(config);
            waits(100); 
            runs(function() {
                expect(s_d).toBeDefined();
                expect(s.t).toBeDefined();
            });

        });

    });


});

