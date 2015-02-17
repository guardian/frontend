define([
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/$',
    'common/modules/navigation/navigation',
    'helpers/fixtures'
], function(
    bonzo,
    bean,
    fastdom,
    $,
    Navigation,
    fixtures
) {
    describe("Navigation", function() {

        beforeEach(function() {
            fixtures.render({
                id: 'navigation-fixture',
                fixtures: [
                        '<div class="js-navigation-header navigation--collapsed">' +
                        '<a class="js-navigation-toggle" href="#footer-nav" data-target-nav="js-navigation-header"></a>' +
                        '<div class="js-mega-nav-placeholder"></div>' +
                        '</div>' +
                        '<div class="js-transfuse" data-transfuse-target="js-mega-nav-placeholder">Nav</div>'
                ]
            })
        });

        afterEach(function() {
            fixtures.clean('navigation-fixture');
        });

        it("should add mega nav menu", function(done) {
            var sut = new Navigation();

            sut.init();
            sut.setMegaNavState(true);

            fastdom.defer(5, function () {
                expect($('.js-mega-nav-placeholder').html()).toEqual('Nav');
                done();
            });
        });

        it("should change all sections link", function() {
            var sut = new Navigation();

            expect($('.js-navigation-header .js-navigation-toggle').attr("href")).toEqual("#footer-nav");
            sut.replaceAllSectionsLink();
            expect($('.js-navigation-header .js-navigation-toggle').attr("href")).toEqual("#nav-allsections");
        });

        it("should toggle navigation class", function(done) {
            var sut = new Navigation();
            sut.init();

            var className = $('.js-navigation-toggle').attr('data-target-nav');

            expect($('.' + className).hasClass('navigation--collapsed')).toBeTruthy();

            sut.enableMegaNavToggle();
            bean.fire($('.js-navigation-toggle')[0], 'click');

            fastdom.defer(1, function () {
                expect($('.' + className).hasClass('navigation--expanded')).toBeTruthy();
                done();
            });
        });
    });
});

