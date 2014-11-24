define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    $,
    fixtures
) {

    describe('Article Aside Adverts', {
        moduleName: 'common/modules/commercial/article-aside-adverts',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            contentType: 'Article'
                        }
                    };
                }
            }
        },
        specify: function () {

            var fixturesConfig = {
                    id: 'article-aside-adverts',
                    fixtures: [
                        '<div class="content__secondary-column">' +
                        '<div class="js-mpu-ad-slot"></div>' +
                        '</div>'
                    ]
                },
                $fixturesContainer;

            beforeEach(function () {
                fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function (articleAsideAdverts) {
                expect(articleAsideAdverts).toBeDefined();
            });

            it('should return the ad slot container on init', function (articleAsideAdverts) {
                var adSlot = articleAsideAdverts.init()[0];
                expect(adSlot).toBe(qwery('.js-mpu-ad-slot', $fixturesContainer)[0]);
            });

            it('should append ad slot', function (articleAsideAdverts) {
                articleAsideAdverts.init();
                expect(qwery('.js-mpu-ad-slot > .ad-slot', $fixturesContainer).length).toBe(1);
            });

            it('should have the correct ad name', function (articleAsideAdverts) {
                articleAsideAdverts.init();
                expect($('.ad-slot', $fixturesContainer).data('name')).toBe('right');
            });

            it('should have the correct size mappings', function (articleAsideAdverts) {
                articleAsideAdverts.init();
                expect($('.ad-slot', $fixturesContainer).data('mobile')).toBe('1,1|300,250|300,251|300,600');
            });

            it('should not display ad slot if standard-adverts switch is off', function (articleAsideAdverts, deps) {
                deps['common/utils/config'].switches.standardAdverts = false;
                expect(articleAsideAdverts.init()).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            });

            it('should not display ad slot if not on an article', function (articleAsideAdverts, deps) {
                deps['common/utils/config'].page.contentType = 'Gallery';
                expect(articleAsideAdverts.init()).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            });

            it('should not add ad slot to hidden column', function (articleAsideAdverts) {
                $('.content__secondary-column', $fixturesContainer).css('display', 'none');
                articleAsideAdverts.init();
                expect($('.ad-slot', $fixturesContainer).length).toBe(0);
            });

        }
    });

});
