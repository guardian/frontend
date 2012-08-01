define(['common', 'modules/popular'], function(common, Popular) {

    describe("Popular", function() {
       
        var callback;

        beforeEach(function() {
            callback = sinon.spy(function(){});
            common.pubsub.on('modules:popular:loaded', callback);
        });

        // json test needs to be run asynchronously 
        it("should request the most popular feed and graft it on to the dom", function(){
            
            appendTo = document.getElementById('popular-1');
            
            runs(function() {
                var r = new Popular(appendTo).load('fixtures/popular');
            });

            waits(1);

            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
            });
        });
    
    });
})
