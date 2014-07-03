define(['common/utils/$', 'common/utils/mediator', 'EventEmitter'], function ($, mediator, EventEmitter) {
    
    describe("Common", function() {
        
        it("should contain an shared instance of event emitter", function() {
            expect(mediator instanceof EventEmitter).toBeTruthy();
        });
        
        it("should contain an shared instance of bonzo/qwery selector engine", function() {
            expect($('body').length).toBe(1);
        });

    });

});
