define(['common', 'ajax', 'modules/lazyload'], function(common, ajax, lazyLoad) {

    describe("Popular", function() {
       
        var popularLoadedCallback;

        beforeEach(function() {
            ajax.init("");
            popularLoadedCallback = sinon.stub();
            common.mediator.on('modules:popular:loaded', popularLoadedCallback);
        });

        // json test needs to be run asynchronously 
        it("should request the most popular feed and graft it on to the dom", function(){
            
            appendTo = document.getElementById('popular-1');
            
            runs(function() {
                //new Popular(appendTo).load('fixtures/popular');
                lazyLoad({
                    url: 'fixtures/popular',
                    container: appendTo,
                    jsonpCallbackName: 'showMostPopular',
                    success: function () {
                        console.log('#############')
                        common.mediator.emit('modules:popular:loaded');
                    }
                });
            });

            waits(500);

            runs(function(){
                expect(popularLoadedCallback).toHaveBeenCalledOnce();
                expect(appendTo.innerHTML).toBe('<b>popular</b>');
            });
        });
    
    });
});