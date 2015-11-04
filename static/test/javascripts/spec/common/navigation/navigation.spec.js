define([
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/$',
    'common/modules/navigation/navigation',
    'helpers/fixtures'
], function (
    bonzo,
    bean,
    fastdom,
    $,
    sut,
    fixtures
) {
    describe('Navigation', function () {

        beforeEach(function () {
            fixtures.render({
                id: 'navigation-fixture',
                fixtures: [
                        '<div class="js-navigation-header navigation-container--collapsed">' +
                        '<a class="js-navigation-toggle" href="#footer-nav" data-target-nav="js-navigation-header"></a>' +
                        '<div class="js-mega-nav-placeholder"></div>' +
                        '</div>' +
                        '<div class="js-mega-nav"><div class="global-navigation">Nav</div></div>'
                ]
            });
        });

        afterEach(function () {
            fixtures.clean('navigation-fixture');
        });

        it('should initialise', function () {
            expect(sut).toEqual(jasmine.any(Object));

            spyOn(sut, 'copyMegaNavMenu');
            spyOn(sut, 'enableMegaNavToggle');
            spyOn(sut, 'replaceAllSectionsLink');

            sut.init();

            expect(sut.copyMegaNavMenu).toHaveBeenCalled();
            expect(sut.enableMegaNavToggle).toHaveBeenCalled();
            expect(sut.replaceAllSectionsLink).toHaveBeenCalled();
        });

        it('should copy mega nav menu to placeholder', function (done) {

            sut.copyMegaNavMenu();

            fastdom.defer(1, function () {
                expect($('.js-mega-nav-placeholder').html()).toEqual('<div class="global-navigation">Nav</div>');
                done();
            });
        });

        it('should change all sections link', function () {
            expect($('.js-navigation-header .js-navigation-toggle').attr('href')).toEqual('#footer-nav');

            sut.replaceAllSectionsLink();

            expect($('.js-navigation-header .js-navigation-toggle').attr('href')).toEqual('#nav-allsections');
        });

        it('should toggle navigation class', function (done) {
            var className = $('.js-navigation-toggle').attr('data-target-nav');

            expect($('.' + className).hasClass('navigation-container--collapsed')).toBeTruthy();

            sut.enableMegaNavToggle();
            bean.fire($('.js-navigation-toggle')[0], 'click');

            fastdom.defer(1, function () {
                expect($('.' + className).hasClass('navigation-container--expanded')).toBeTruthy();
                done();
            });
        });
    });
});

