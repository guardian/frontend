    define([
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/commercial/loader',
    'helpers/fixtures'
], function(
    mediator,
    ajax,
    CommercialComponent,
    fixtures
) {

    describe("Commercial component loader", function() {

        var adSlot, callback, appendTo, server,
            options = {
                config: {
                    page: {
                        keywords: 'a,b,c',
                        section: 's',
                        ajaxUrl: '',
                        ab_commercialInArticleDesktop: 'inline'

                    }
                }
            };

        beforeEach(function() {

            // ...
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});

            // stub the success callback
            callback = sinon.stub();
            mediator.on('modules:commercial/loader:loaded', callback);

            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;

            // fixtures
            fixtures.render({
                id: 'commercial-loader-fixtures',
                fixtures: ['<div id="ad-slot">...</div>']
            });

            adSlot = document.getElementById('ad-slot');

            // a new user
            localStorage.removeItem('gu.history');
        });

        afterEach(function() {
            server.restore();
            fixtures.clean('commercial-loader-fixtures');
        });

        it("Exists", function() {
            expect(new CommercialComponent(options)).toBeDefined();
        });

        it("Provides an interface to load each component", function() {
            expect(new CommercialComponent(options).init('travel')).toBeDefined();
            expect(new CommercialComponent(options).init('jobs')).toBeDefined();
            expect(new CommercialComponent(options).init('masterclasses')).toBeDefined();
            expect(new CommercialComponent(options).init('soulmates')).toBeDefined();
        });


        it("Passes section and keyword to a travel component from the commercial server", function() {
            server.respondWith("/commercial/travel/offers.json?seg=new&s=s&k=a&k=b&k=c", [200, {}, '{ "html": "<b>advert</b>" }']);
            runs(function() {
                new CommercialComponent(options).init('travel', adSlot);
            });
            waitsFor(function () {
                return callback.called === true;
            }, 'success never called', 500);
            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(adSlot.innerHTML).toBe('<b>advert</b>');
            });
        });

        it("Passes segment information to the commercial component", function() {

            // two visits = a return visitor
            var history = '{"value":[{"id":"/"},{"id":"/"}]}';

            // a repeat user
            localStorage.setItem('gu.history', history);

            server.respondWith("/commercial/masterclasses.json?seg=repeat&s=s", [200, {}, '{ "html": "<b>advert</b>" }']);
            runs(function() {
                new CommercialComponent(options).init('masterclasses', adSlot);
            });
            waitsFor(function () {
                return callback.called === true;
            }, 'success never called', 500);
            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
            });
        });

        // OAS can inject a url in to the advert code to track clicks on the component
        it("Injects an OAS tracker URL in to the response", function() {
            server.respondWith("/commercial/jobs.json?seg=new&s=s&k=a&k=b&k=c", [200, {}, '{ "html": "<b>%OASToken% - %OASToken%</b>" }']);
            runs(function() {
                options.oastoken = '123';
                new CommercialComponent(options).init('jobs', adSlot);
            });
            waitsFor(function () {
                return callback.called === true;
            }, 'success never called', 500);
            runs(function(){
                expect(callback).toHaveBeenCalledOnce();
                expect(adSlot.innerHTML).toBe('<b>123 - 123</b>');
            });
        });
    });
});
