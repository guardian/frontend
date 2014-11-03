define([
    'qwery',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    fixtures
) {

    var tabStub;

    describe('Commercial component loader', {
        moduleName: 'common/modules/commercial/loader',
        mock: function () {
            return {
                'common/modules/ui/tabs': function () {
                    return function () {
                        return {
                            init: sinon.stub()
                        }
                    }
                },
                'common/utils/config': function () {
                    return {
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            ajaxUrl:    '',
                            isbn:       9780701189426,
                            keywordIds: 'books/annerice,books/fiction,books/books,culture/culture',
                            pageId:     'books/2014/oct/31/prince-lestat-anne-rice-review',
                            section:    'books'

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
                        '<div class="ad-slot"></div>'
                    ]
                };

            beforeEach(function() {
                // set up fake server
                server = sinon.fakeServer.create();
                server.autoRespond = true;
                server.autoRespondAfter = 20;

                // fixtures
                var $fixturesContainer = fixtures.render(fixturesConfig);

                adSlot = qwery('.ad-slot', $fixturesContainer)[0];
            });

            afterEach(function () {
                server.restore();
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function (CommercialComponent) {
                expect(new CommercialComponent()).toBeDefined();
            });

            it('should load component with keyword params', function (CommercialComponent, deps, done) {
                deps['common/utils/mediator'].on('modules:commercial:loader:loaded', done);

                server.respondWith(
                    '/commercial/money/bestbuys.json?k=annerice&k=fiction&k=books&k=culture',
                    [200, {}, '{ "html": "" }']
                );

                new CommercialComponent().init('bestbuy', adSlot);
            });

            it('should use pageId if no keywordIds', function (CommercialComponent, deps, done) {
                deps['common/utils/mediator'].on('modules:commercial:loader:loaded', done);
                deps['common/utils/config'].page.keywordIds = '';

                server.respondWith(
                    '/commercial/money/bestbuys.json?k=prince-lestat-anne-rice-review',
                    [200, {}, '{ "html": "" }']
                );

                new CommercialComponent().init('bestbuy', adSlot);
            });

            it('should load component into the slot', function (CommercialComponent, deps, done) {
                deps['common/utils/mediator'].on('modules:commercial:loader:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<p>Commercial Component</p>');
                    done();
                });

                server.respondWith([200, {}, '{ "html": "<p>Commercial Component</p>" }']);

                new CommercialComponent().init('bestbuy', adSlot);
            });

            it('should load replace oastoken token', function (CommercialComponent, deps, done) {
                deps['common/utils/mediator'].on('modules:commercial:loader:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<p>OASToken: 123</p>');
                    done();
                });

                server.respondWith([200, {}, '{ "html": "<p>OASToken: %OASToken%</p>" }']);

                new CommercialComponent({ oastoken: '123' }).init('bestbuy', adSlot);
            });

            it('should be able to run post load events', function (CommercialComponent, deps, done) {
                server.respondWith([200, {}, '{ "html": "" }']);

                var cc = new CommercialComponent();
                // add post load event
                cc.postLoadEvents.book = function (el) {
                    expect(el).toBe(adSlot);
                    done();
                };
                cc.init('book', adSlot);
            });

            [
                {
                    name:    'book',
                    url:     '/commercial/books/book.json?t=9780701189426&k=annerice&k=fiction&k=books&k=culture'
                },
                {
                    name:    'jobs',
                    url:     '/commercial/jobs.json?t=123&t=456&k=annerice&k=fiction&k=books&k=culture',
                    options: { jobIds: '123,456' }
                },
                {
                    name:    'travel',
                    url:     '/commercial/travel/offers.json?s=books&k=annerice&k=fiction&k=books&k=culture'
                },
                {
                    name:    'travelHigh',
                    url:     '/commercial/travel/offers-high.json?s=books&k=annerice&k=fiction&k=books&k=culture'
                },
                {
                    name:    'multi',
                    url:     '/commercial/multi.json?c=book&c=jobs&k=annerice&k=fiction&k=books&k=culture',
                    options: { components: ['book', 'jobs'] }
                },
                {
                    name:    'capi',
                    url:     '/commercial/capi.json?s=books&' +
                        't=p%2F4xv7c&' +
                        't=p%2F4vc5z&' +
                        'k=music%2Fledzeppelin&' +
                        'k=music%2Fpinkfloyd&' +
                        'l=http%3A%2F%2Fcats.com%2Fimage.jpeg&' +
                        'ct=Led%20Zeppelin%20special&' +
                        'cl=http%3A%2F%2Ftheguardian.com%2Fmusic%2Fledzeppelin&' +
                        'cal=http%3A%2F%2Ftheguardian.com%2Fabout',
                    options: {
                        capi:             ['p/4xv7c', 'p/4vc5z'],
                        capiAboutLinkUrl: 'http://theguardian.com/about',
                        capiKeywords:     'music/ledzeppelin,music/pinkfloyd',
                        capiLinkUrl:      'http://theguardian.com/music/ledzeppelin',
                        capiTitle:        'Led Zeppelin special',
                        logo:             'http://cats.com/image.jpeg'
                    }
                }
            ].forEach(function (testConfig) {

                it('should correctly load "' + testConfig.name  + '" component', function (CommercialComponent, deps, done) {
                    deps['common/utils/mediator'].on('modules:commercial:loader:loaded', done);

                    server.respondWith(testConfig.url, [200, {}, '{ "html": "" }']);

                    new CommercialComponent(testConfig.options).init(testConfig.name, adSlot);
                })
            });

        }
    });

});
