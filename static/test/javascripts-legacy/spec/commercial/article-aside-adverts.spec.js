
define([
    'qwery',
    'lib/mediator',
    'helpers/fixtures',
    'helpers/injector'
], function (
    qwery,
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
                '<div class="js-content-main-column" style="height:90000px;min-height:90000px;max-height:90000px;"></div>' +
                '<div class="content__secondary-column js-secondary-column">' +
                '<div class="ad-slot-container">' +
                '<div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,600|fluid">' +
                '</div></div></div>'
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

        it('should exist', function (done) {
            expect(articleAsideAdverts).toBeDefined();
            expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            done();
        });

        it('should have the correct size mappings and classes', function (done) {
            articleAsideAdverts.articleAsideAdvertsInit(noop, noop).then(done);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList).toContain('js-sticky-mpu');
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,600|fluid');
            });
        });

        it('should mutate the ad slot in short articles', function (done) {

            document.querySelector('.js-content-main-column').setAttribute("style", "height:10px; min-height:10px; max-height:10px; overflow:hidden;");

            articleAsideAdverts.articleAsideAdvertsInit(noop, noop).then(done);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList).not.toContain('js-sticky-mpu');
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|fluid');
            });
        });

        it('should not do anything if disabled in commercial-feature-switches', function (done) {
            commercialFeatures.articleAsideAdverts = false;

            articleAsideAdverts.articleAsideAdvertsInit(noop, noop).then(function (returned) {
                expect(returned).toBe(false);
                done();
            });
        });
    });
});
