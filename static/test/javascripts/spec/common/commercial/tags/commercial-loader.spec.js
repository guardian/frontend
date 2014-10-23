define([
    'common/utils/ajax',
    'common/utils/mediator',
    'helpers/fixtures',
    'jasq'
], function (
    ajax,
    mediator,
    fixtures
) {

    var getParaWithSpaceStub, $fixturesContainer;

    describe('Commercial component loader', {
        moduleName: 'common/modules/commercial/loader',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            keywordIds: 's/a,s/b,s/c',
                            section: 's',
                            ajaxUrl: '',
                            ab_commercialInArticleDesktop: 'inline'

                        }
                    };
                }
            }
        },
        specify: function () {

            var adSlot, server,
                fixturesConfig = {
                    id: 'commercial-loader-fixtures',
                    fixtures: [
                        '<div id="ad-slot"></div>'
                    ]
                };

            beforeEach(function() {

                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;

                // fixtures
                fixtures.render(fixturesConfig);

                adSlot = document.getElementById('ad-slot');

                // a new user
                localStorage.removeItem('gu.history');
            });

            afterEach(function () {
                server.restore();
                fixtures.clean(fixturesConfig.id);
            });

            it('Exists', function (CommercialComponent) {
                expect(new CommercialComponent()).toBeDefined();
            });

            it('Provides an interface to load each component', function (CommercialComponent) {
                expect(new CommercialComponent().init('travel')).toBeDefined();
                expect(new CommercialComponent().init('jobs')).toBeDefined();
                expect(new CommercialComponent().init('masterclasses')).toBeDefined();
                expect(new CommercialComponent().init('soulmates')).toBeDefined();
            });


            it('Passes section and keyword to a travel component from the commercial server', function (CommercialComponent, deps, done) {
                deps['common/utils/ajax'].init({
                    page: {
                        ajaxUrl: '',
                        edition: 'UK'
                    }
                });
                deps['common/utils/mediator'].once('modules:commercial/loader:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<b>advert</b>');
                    done();
                });
                server.respondWith('/commercial/travel/offers.json?s=s&k=a&k=b&k=c', [200, {}, '{ "html": "<b>advert</b>" }']);

                new CommercialComponent().init('travel', adSlot);
            });

            // OAS can inject a url in to the advert code to track clicks on the component
            it('Injects an OAS tracker URL in to the response', function (CommercialComponent, deps, done) {
                deps['common/utils/ajax'].init({
                    page: {
                        ajaxUrl: '',
                        edition: 'UK'
                    }
                });
                deps['common/utils/mediator'].once('modules:commercial/loader:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<b>123 - 123</b>');
                    done();
                });
                server.respondWith('/commercial/jobs.json?&k=a&k=b&k=c', [200, {}, '{ "html": "<b>%OASToken% - %OASToken%</b>" }']);

                new CommercialComponent({ oastoken: '123' }).init('jobs', adSlot);
            });

            it('Injects jobIds if specified', function (CommercialComponent, deps, done) {
                deps['common/utils/ajax'].init({
                    page: {
                        ajaxUrl: '',
                        edition: 'UK'
                    }
                });
                deps['common/utils/mediator'].once('modules:commercial/loader:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<b>advert</b>');
                    done();
                });
                server.respondWith('/commercial/jobs.json?t=1234&t=5678&k=a&k=b&k=c', [200, {}, '{ "html": "<b>advert</b>" }']);

                new CommercialComponent({ jobIds: '1234,5678' }).init('jobs', adSlot);
            });

        }
    });

});
