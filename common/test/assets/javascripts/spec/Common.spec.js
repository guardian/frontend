define(['common', 'EventEmitter'], function (common, EventEmitter) {
    
    describe("Common", function() {
        
        it("should contain an shared instance of event emitter", function() {
            expect(common.mediator instanceof EventEmitter).toBeTruthy();
        });
        
        it("should contain an shared instance of bonzo/qwery selector engine", function() {
            expect(common.$g('body').length).toBe(1);
        });

    });

});
