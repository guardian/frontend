define([
    'common/$',
    'bonzo',
    'helpers/fixtures',
    'common/modules/adverts/article-aside-adverts'
], function(
    $,
    bonzo,
    fixtures,
    ArticleAsideAdverts
){

    describe('Article Aside Adverts', function() {

        var fixturesConfig = {
                id: 'article-aside-adverts',
                fixtures: [
                    '<div class="js-right-hand-component" style="height: 1px">' +
                        '<div class="js-mpu-ad-slot"></div>' +
                    '</div>'
                ]
            },
            createSwitch = function(value){
                return {
                    switches: {
                        standardAdverts: value
                    }
                };
            };

        beforeEach(function() {
            fixtures.render(fixturesConfig);
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
        });

        it('should be able to instantiate', function() {
            var articleAsideAdverts = new ArticleAsideAdverts();
            expect(articleAsideAdverts).toBeDefined();
        });

        it('should not initiated if standard-adverts switch is off', function() {
            var articleAsideAdverts = new ArticleAsideAdverts(createSwitch(false));
            expect(articleAsideAdverts.init()).toBeFalsy();
        });

        it('should return the ad slot container on init', function() {
            var articleAsideAdverts = new ArticleAsideAdverts(createSwitch(true));
            expect(articleAsideAdverts.init()[0]).toBe($('#' + fixturesConfig.id + ' .js-mpu-ad-slot')[0]);
        });

        it('should have the correct ad name', function() {
            var articleAsideAdverts = new ArticleAsideAdverts(createSwitch(true));
            articleAsideAdverts.init();
            expect($('#' + fixturesConfig.id + ' .ad-slot').data('name')).toBe('right');
        });

        it('should have the correct size mappings', function() {
            var articleAsideAdverts = new ArticleAsideAdverts(createSwitch(true));
            articleAsideAdverts.init();
            expect($('#' + fixturesConfig.id + ' .ad-slot').data('tabletlandscape')).toBe('300,250');
        });

        it('should not add ad slot to hidden column', function() {
            $('#' + fixturesConfig.id + ' .article__secondary-column').css('display', 'none');
            var articleAsideAdverts = new ArticleAsideAdverts(createSwitch(true));
            expect($('#' + fixturesConfig.id + ' .ad-slot').length).toBe(0);
        });

    });

});
