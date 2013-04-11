define(['common', 'ajax', 'modules/popular'], function(common, ajax, popular) {

    describe("Popular", function() {
       
        var popularLoadedCallback;

        beforeEach(function() {
            ajax.init("");
            popularLoadedCallback = sinon.stub();
            common.mediator.on('modules:popular:loaded', popularLoadedCallback);
        });

        // json test needs to be run asynchronously 
        it("should request the most popular feed and graft it on to the dom", function(){
            
            appendTo = document.querySelector('.js-popular');
            
            runs(function() {
                popular({}, document, 'fixtures/popular');
            });

            waits(500);

            runs(function(){
                expect(popularLoadedCallback).toHaveBeenCalledOnce();
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
            });
        });
    
    });
});