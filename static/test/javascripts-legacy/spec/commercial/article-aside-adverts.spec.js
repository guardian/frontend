
define([
    'fastdom',
    'qwery',
    'lib/$',
    'lib/mediator',
    'helpers/fixtures',
    'helpers/injector'
], function (
    fastdom,
    qwery,
    $,
    mediator,
    fixtures,
    Injector
) {
    var articleAsideAdverts,
        commercialFeatures,
        injector = new Injector();

    function noop() {

    }

    describe('Article Aside Adverts', function () {

        var fixturesConfig = {
                id: 'article-aside-adverts',
                fixtures: [
                    '<div class="content__secondary-column js-secondary-column">' +
                    '<div class="js-ad-slot-container"></div>' +
                    '</div>'
                ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);

            injector.require([
                'commercial/modules/article-aside-adverts',
                'commercial/modules/commercial-features'
            ], function () {
                articleAsideAdverts = arguments[0];
                commercialFeatures = arguments[1];

                // Reset dependencies
                commercialFeatures.articleAsideAdverts = true;

                var pubAds = {
                    listeners: [],
                    addEventListener: sinon.spy(function (eventName, callback) { this.listeners[eventName] = callback; }),
                    setTargeting: sinon.spy(),
                    enableSingleRequest: sinon.spy(),
                    collapseEmptyDivs: sinon.spy(),
                    refresh: sinon.spy()
                },
                sizeMapping = {
                    sizes: [],
                    addSize: sinon.spy(function (width, sizes) {
                        this.sizes.unshift([width, sizes]);
                    }),
                    build: sinon.spy(function () {
                        var tmp = this.sizes;
                        this.sizes = [];
                        return tmp;
                    })
                };

                window.googletag = {
                    cmd: {
                        push: function() {
                            var args = Array.prototype.slice.call(arguments);
                            args.forEach(function(command) {
                                command();
                            });
                        }
                    },
                    pubads: function () {
                        return pubAds;
                    },
                    sizeMapping: function () {
                        return sizeMapping;
                    },
                    defineSlot: sinon.spy(function () { return window.googletag; }),
                    defineOutOfPageSlot: sinon.spy(function () { return window.googletag; }),
                    addService: sinon.spy(function () { return window.googletag; }),
                    defineSizeMapping: sinon.spy(function () { return window.googletag; }),
                    setTargeting: sinon.spy(function () { return window.googletag; }),
                    enableServices: sinon.spy(),
                    display: sinon.spy()
                };

                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(articleAsideAdverts).toBeDefined();
        });

        it('should return the ad slot container on init', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.parentNode).toBe(qwery('.js-ad-slot-container', $fixturesContainer)[0]);
                done();
            });
        });

        it('should append ad slot', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot).not.toBeNull();
                done();
            });
        });

        it('should have the correct ad name', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.getAttribute('data-name')).toBe('right');
                done();
            });
        });

        it('should have the correct size mappings', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|fluid');
                done();
            });
        });

        it('should not display ad slot if disabled in commercial-feature-switches', function (done) {
            commercialFeatures.articleAsideAdverts = false;

            articleAsideAdverts.init(noop, noop).then(function (returned) {
                expect(returned).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                done();
            });
        });
    });
});
