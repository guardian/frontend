define([
    'qwery',
    'helpers/fixtures',
    'common/utils/$',
    'common/modules/commercial/article-aside-adverts'
], function(
    qwery,
    fixtures,
    $,
    articleAsideAdverts
){

    describe('Article Aside Adverts', function() {

        var fixturesConfig = {
                id: 'article-aside-adverts',
                fixtures: [
                    '<div class="content__secondary-column">' +
                        '<div class="js-mpu-ad-slot"></div>' +
                    '</div>'
                ]
            },
            fixture,
            config;

        beforeEach(function() {
            fixtures.render(fixturesConfig);
            fixture = qwery('#' + fixturesConfig.id)[0];
            config = {
                switches: {
                    standardAdverts: true
                },
                page: {
                    contentType: 'Article'
                }
            };
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
            articleAsideAdverts.reset();
        });

        it('should exist', function() {
            expect(articleAsideAdverts).toBeDefined();
        });

        it('should not display ad slot if standard-adverts switch is off', function() {
            config.switches.standardAdverts = false;
            expect(articleAsideAdverts.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should not display ad slot if not on an article', function() {
            config.page.contentType = 'Gallery';
            expect(articleAsideAdverts.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should return the ad slot container on init', function() {
            var adSlot = articleAsideAdverts.init(config)[0];
            expect(adSlot).toBe(qwery('.js-mpu-ad-slot', fixture)[0]);
        });

        it('should append ad slot', function() {
            articleAsideAdverts.init(config);
            expect(qwery('.js-mpu-ad-slot > .ad-slot', fixture).length).toBe(1);
        });

        it('should have the correct ad name', function() {
            articleAsideAdverts.init(config);
            expect($('.ad-slot', fixture).data('name')).toBe('right');
        });

        it('should have the correct size mappings', function() {
            articleAsideAdverts.init(config);
            expect($('.ad-slot', fixture).data('rightCol')).toBe('300,250|300,600');
        });

        it('should not add ad slot to hidden column', function() {
            $('.content__secondary-column', fixture).css('display', 'none');
            articleAsideAdverts.init(config);
            expect($('.ad-slot', fixture).length).toBe(0);
        });

    });

});
