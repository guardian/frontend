
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

        beforeEach(function (done) {

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

        it('should exist', function () {
            expect(articleAsideAdverts).toBeDefined();
        });

        it('should have the correct size mappings and classes', function () {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList.contains('js-sticky-mpu').toBe(true));
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,600|fluid');
            });
        });

        it('should mutate the ad slot in short articles', function () {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList.contains('js-sticky-mpu').toBe(false));
                expect(adSlot.getAttribute('data-mobile').toBe('1,1|2,2|300,250|fluid'));
            });
        });

        it('should not do anything if disabled in commercial-feature-switches', function (done) {
            commercialFeatures.articleAsideAdverts = false;

            articleAsideAdverts.init(noop, noop).then(function (returned) {
                expect(returned).toBe(false);
                done();
            });
        });
    });
});
