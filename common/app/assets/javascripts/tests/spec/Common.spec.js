define(['common'], function(common) {
    
    describe("Common", function() {
        
        it("should contain an shared instance of event emitter", function() {
            expect(common.pubsub instanceof EventEmitter).toBeTruthy();
        });

    });

});
