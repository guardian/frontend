define(['utils/mediator', 'modules/commercial/loader', 'helpers/fixtures'], function(mediator, CommercialComponent, fixtures) {

    describe("Commercial component loader", function() {

        var callback, appendTo, server;

        beforeEach(function() {
            
            // stub the success callback 
            callback = sinon.stub();
            mediator.on('modules:commercial/lodaer:loaded', callback);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            
            // fixtures
            fixtures.render({
                id: 'commercial-loader-fixtures',
                fixtures: ['<div class="ad-slot">...</div>']
            });
        });

        afterEach(function() {
            server.restore();
            fixtures.clean('related-fixtures');
        });

        it("exists", function() {
            //expect(new CommercialComponent()).toBeDefined();
        }); 
        
        it("keywords", function() {
            //expect(new CommercialComponent({ config: { } })).toBeDefined();
        });

        it("sections", function() {});
        it("injects an oastoken", function() {});
        it("loads a component", function() {});
        it("context", function() {});
        it("", function() {});

        // ...
        xit("breakpoints", function() {});
        xit("populate", function() {
            //server.respondWith('/related/' + pageId + '.json?_edition=UK', [200, {}, '{ "html": "<b>1</b>" }']);
            //waits(500);
            //expect(callback).toHaveBeenCalledOnce();
            //expect(appendTo.innerHTML).toBe('<b>1</b>');
        });
        

    });
});
