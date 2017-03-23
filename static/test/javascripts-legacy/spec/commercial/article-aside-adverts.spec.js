
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
                '<div class="js-content-main-column"></div>' +
                '<div class="content__secondary-column js-secondary-column">' +
                '<div class="js-ad-slot-container">' +
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

        it('should have the correct size mappings and classes', function () {
             // this is not currently passing due to $mainCol.dim()height returning 0...
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList).toContain('js-sticky-mpu');
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,600|fluid');
            });
        });

        it('should mutate the ad slot in short articles', function () {
            articleAsideAdverts.init(noop, noop);
            mediator.once('page:commercial:right', function (adSlot) {
                expect(adSlot.classList).not.toContain('js-sticky-mpu');
                expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|fluid');
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
