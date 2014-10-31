define([
    'bonzo',
    'bean',
    'common/utils/$',
    'common/modules/navigation/navigation',
    'helpers/fixtures'
], function(
    bonzo,
    bean,
    $,
    sut,
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

        it("should initialise", function() {
            expect(sut).toEqual(jasmine.any(Object));

            spyOn(sut, "addMegaNavMenu");
            spyOn(sut, "enableMegaNavToggle");
            spyOn(sut, "replaceAllSectionsLink");

            sut.init();

            expect(sut.addMegaNavMenu).toHaveBeenCalled();
            expect(sut.enableMegaNavToggle).toHaveBeenCalled();
            expect(sut.replaceAllSectionsLink).toHaveBeenCalled();
        });

        it("should add mega nav menu", function() {
            sut.addMegaNavMenu();

            expect($('.js-mega-nav-placeholder').html()).toEqual('Nav');
        });

        it("should change all sections link", function() {
            expect($('.js-navigation-header .js-navigation-toggle').attr("href")).toEqual("#footer-nav");

            sut.replaceAllSectionsLink();

            expect($('.js-navigation-header .js-navigation-toggle').attr("href")).toEqual("#nav-allsections");
        });

        it("should toggle navigation class", function() {
            var className = $('.js-navigation-toggle').attr('data-target-nav');

            expect($('.' + className).hasClass('navigation--collapsed')).toBeTruthy();

            sut.enableMegaNavToggle();

            bean.fire($('.js-navigation-toggle')[0], 'click');

            expect($('.' + className).hasClass('navigation--expanded')).toBeTruthy();
        });
    });
});

