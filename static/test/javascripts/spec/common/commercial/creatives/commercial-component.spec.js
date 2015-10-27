define([
    'qwery',
    'common/utils/_',
    'helpers/fixtures',
    'helpers/injector'
], function (
    qwery,
    _,
    fixtures,
    Injector
) {
    xdescribe('Commercial component loader', function () {

        var adSlot, server,
            fixturesConfig = {
                id: 'commercial-loader-fixtures',
                fixtures: [
                    '<div class="ad-slot"></div>'
                ]
            },
            injector = new Injector(),
            CommercialComponent, config, mediator;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/creatives/commercial-component',
                'common/utils/config',
                'common/utils/mediator'], function () {

                    CommercialComponent = arguments[0];
                    config = arguments[1];
                    mediator = arguments[2];

                    config.page = {
                        ajaxUrl:    '',
                        isbn:       9780701189426,
                        keywordIds: 'books/annerice,books/fiction,books/books,culture/culture',
                        pageId:     'books/2014/oct/31/prince-lestat-anne-rice-review',
                        section:    'books'
                    };
                    config.switches = {
                        standardAdverts: true
                    };

                    // set up fake server
                    server = sinon.fakeServer.create();
                    server.autoRespond = true;
                    server.autoRespondAfter = 20;

                    // fixtures
                    var $fixturesContainer = fixtures.render(fixturesConfig);

                    adSlot = qwery('.ad-slot', $fixturesContainer)[0];

                    done();
                });
        });

        afterEach(function () {
            mediator.removeAllListeners();
            server.restore();
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(new CommercialComponent()).toBeDefined();
        });

        it('should load component with keyword params', function (done) {
            mediator.once('modules:commercial:creatives:commercial-component:loaded', done);

            server.respondWith(
                '/commercial/money/bestbuys.json?k=annerice&k=fiction&k=books&k=culture',
                [200, {}, '{ "html": "" }']
            );

            new CommercialComponent(adSlot, { type: 'bestbuy' }).create();
        });

        it('should use pageId if no keywordIds', function (done) {
            mediator.once('modules:commercial:creatives:commercial-component:loaded', done);
            config.page.keywordIds = '';

            server.respondWith(
                '/commercial/money/bestbuys.json?k=prince-lestat-anne-rice-review',
                [200, {}, '{ "html": "" }']
            );

            new CommercialComponent(adSlot, { type: 'bestbuy' }).create();
        });

        it('should load component into the slot', function (done) {
            mediator.once('modules:commercial:creatives:commercial-component:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<p>Commercial Component</p>');
                    done();
                });

            server.respondWith([200, {}, '{ "html": "<p>Commercial Component</p>" }']);

            new CommercialComponent(adSlot, { type: 'bestbuy' }).create();
        });

        it('should load replace oastoken token', function (done) {
            mediator.once('modules:commercial:creatives:commercial-component:loaded', function () {
                    expect(adSlot.innerHTML).toBe('<p>OASToken: 123</p>');
                    done();
                });

            server.respondWith([200, {}, '{ "html": "<p>OASToken: %OASToken%</p>" }']);

            new CommercialComponent(adSlot, { type: 'bestbuy', clickMacro: '123' }).create();
        });

        it('should be able to run post load events', function (done) {
            server.respondWith([200, {}, '{ "html": "" }']);

            var commercialComponent = new CommercialComponent(adSlot, { type: 'book' });
            // add post load event
            commercialComponent.postLoadEvents.book = function (el) {
                expect(el).toBe(adSlot);
                delete commercialComponent.postLoadEvents.book;
                done();
            };
            commercialComponent.create();
        });

        [
            {
                type:    'book',
                url:     '/commercial/books/book.json?t=9780701189426&k=annerice&k=fiction&k=books&k=culture'
            },
            {
                type:    'jobs',
                url:     '/commercial/jobs.json?jobIds=123%2C456&k=annerice&k=fiction&k=books&k=culture&t=123&t=456',
                options: { jobIds: '123,456' }
            },
            {
                type:    'travel',
                url:     '/commercial/travel/offers.json?k=annerice&k=fiction&k=books&k=culture'
            },
            {
                type:    'multi',
                url:     '/commercial/multi.json?components=book&components=jobs&k=annerice&k=fiction&k=books&k=culture',
                options: { components: ['book', 'jobs'] }
            },
            {
                type:    'capi',
                url:     '/commercial/capi.json?oastoken=123456789&capi=p%2F43b2q&capi=p%2F43945&' +
                         'logo=http%3A%2F%2Fcats.com%2Fimage.jpeg&capiTitle=Led%20Zeppelin%20special&' +
                         'capiLinkUrl=http%3A%2F%2Ftheguardian.com%2Fmusic%2Fledzeppelin&' +
                         'capiAboutLinkUrl=http%3A%2F%2Ftheguardian.com%2Fabout&' +
                         'capiKeywords=music%2Fledzeppelin&t=p%2F43b2q&t=p%2F43945&' +
                         'k=music%2Fledzeppelin&af=sponsored',
                options: {
                    oastoken:         '123456789',
                    capi:             ['p/43b2q', 'p/43945'],
                    logo:             'http://cats.com/image.jpeg',
                    capiTitle:        'Led Zeppelin special',
                    capiLinkUrl:      'http://theguardian.com/music/ledzeppelin',
                    capiAboutLinkUrl: 'http://theguardian.com/about',
                    capiKeywords:     'music/ledzeppelin',
                    t:                ['p/43b2q', 'p/43945'],
                    k:                'music/ledzeppelin',
                    af:               'sponsored'
                }
            }
        ].forEach(function (testConfig) {

            it('should correctly load "' + testConfig.type  + '" component', function (done) {
                mediator.once('modules:commercial:creatives:commercial-component:loaded', done);

                server.respondWith(testConfig.url, [200, {}, '{ "html": "" }']);

                var params = _.merge({ type: testConfig.type }, testConfig.options);
                new CommercialComponent(adSlot, params).create();
            });
        });

    });
});
