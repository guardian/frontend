
define([
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/mediator',
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
                expect(adSlot[0]).toBe(qwery('.js-ad-slot-container', $fixturesContainer)[0]);
                done();
            });
        });

        it('should append ad slot', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function () {
                expect(qwery('.js-ad-slot-container > .ad-slot', $fixturesContainer).length).toBe(1);
                done();
            });
        });

        it('should have the correct ad name', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function () {
                expect($('.ad-slot', $fixturesContainer).data('name')).toBe('right');
                done();
            });
        });

        it('should have the correct size mappings', function (done) {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function () {
                expect($('.ad-slot', $fixturesContainer).data('mobile')).toBe('1,1|2,2|300,250|fluid');
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
