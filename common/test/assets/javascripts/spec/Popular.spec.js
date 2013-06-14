define(['common', 'ajax', 'modules/popular'], function(common, ajax, popular) {

    describe("Popular", function() {
       
        var popularLoadedCallback,
            server;

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            popularLoadedCallback = sinon.stub();
            common.mediator.on('modules:popular:loaded', popularLoadedCallback);
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function () {
            server.restore();
        });

        // json test needs to be run asynchronously 
        it("should request the most popular feed and graft it on to the dom", function(){

            server.respondWith([200, {}, '{ "html": "<b>popular</b>" }']);
            
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