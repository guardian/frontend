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

        var adSlot, appendTo, server,
            options = {
                config: {
                    page: {
                        keywordIds: 's/a,s/b,s/c',
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


        it("Passes section and keyword to a travel component from the commercial server", function (done) {
            server.respondWith("/commercial/travel/offers.json?s=s&k=a&k=b&k=c", [200, {}, '{ "html": "<b>advert</b>" }']);
            new CommercialComponent(options).init('travel', adSlot);

            mediator.once('modules:commercial/loader:loaded', function () {
                expect(adSlot.innerHTML).toBe('<b>advert</b>');
                done();
            });
        });

        // OAS can inject a url in to the advert code to track clicks on the component
        it("Injects an OAS tracker URL in to the response", function (done) {
            server.respondWith("/commercial/jobs.json?&k=a&k=b&k=c", [200, {}, '{ "html": "<b>%OASToken% - %OASToken%</b>" }']);
            options.oastoken = '123';
            new CommercialComponent(options).init('jobs', adSlot);

            mediator.once('modules:commercial/loader:loaded', function () {
                expect(adSlot.innerHTML).toBe('<b>123 - 123</b>');
                done();
            });
        });

        it("Injects jobIds if specified", function (done) {
            server.respondWith("/commercial/jobs.json?t=1234&t=5678&k=a&k=b&k=c", [200, {}, '{ "html": "<b>advert</b>" }']);
            options.jobIds="1234,5678";
            new CommercialComponent(options).init('jobs', adSlot);

            mediator.once('modules:commercial/loader:loaded', function () {
                expect(adSlot.innerHTML).toBe('<b>advert</b>');
                done();
            });
        });
    });
});
