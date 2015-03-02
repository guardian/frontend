define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    qwery,
    $,
    fixtures,
    Injector
) {

    var config = {
        switches: {
            standardAdverts: true
        },
        page: {
            contentType: 'Article'
        }
    };

    return new Injector()
        .mock({
            'common/utils/config': config
        })
        .require(['common/modules/commercial/article-aside-adverts'], function (articleAsideAdverts) {

            describe('Article Aside Adverts', function () {

                var fixturesConfig = {
                        id: 'article-aside-adverts',
                        fixtures: [
                            '<div class="content__secondary-column js-secondary-column">' +
                            '<div class="js-mpu-ad-slot"></div>' +
                            '</div>'
                        ]
                    },
                    $fixturesContainer;

                beforeEach(function () {
                    config.switches = {
                        standardAdverts: true
                    };
                    config.page = {
                        contentType: 'Article'
                    };

                    $fixturesContainer = fixtures.render(fixturesConfig);
                });

                afterEach(function () {
                    fixtures.clean(fixturesConfig.id);
                });

                it('should exist', function () {
                    expect(articleAsideAdverts).toBeDefined();
                });

                it('should return the ad slot container on init', function () {
                    var adSlot = articleAsideAdverts.init()[0];
                    expect(adSlot).toBe(qwery('.js-mpu-ad-slot', $fixturesContainer)[0]);
                });

                it('should append ad slot', function () {
                    articleAsideAdverts.init();
                    expect(qwery('.js-mpu-ad-slot > .ad-slot', $fixturesContainer).length).toBe(1);
                });

                it('should have the correct ad name', function () {
                    articleAsideAdverts.init();
                    expect($('.ad-slot', $fixturesContainer).data('name')).toBe('right');
                });

                it('should have the correct size mappings', function () {
                    articleAsideAdverts.init();
                    expect($('.ad-slot', $fixturesContainer).data('mobile')).toBe('1,1|300,250|300,251|300,600');
                });

                it('should not display ad slot if standard-adverts switch is off', function () {
                    config.switches.standardAdverts = false;

                    expect(articleAsideAdverts.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });

                it('should not display ad slot if not on an article', function () {
                    config.page.contentType = 'Gallery';

                    expect(articleAsideAdverts.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });
            });

        });

});
