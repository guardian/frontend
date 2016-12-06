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
    var hostedAboutPopup,
        injector = new Injector();

    describe('Article Aside Adverts', function () {

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/hosted/about'
            ], function () {
                hostedAboutPopup = arguments[0];

                done();
            });
        });

        it('should exist', function () {
            expect(hostedAboutPopup).toBeDefined();
        });


        xit('should show the popup', function (done) {
            articleAsideAdverts.init().then(function () {
                expect(qwery('.js-ad-slot-container > .ad-slot', $fixturesContainer).length).toBe(1);
                done();
            });
        });

        xit('should have the correct header text', function (done) {
            articleAsideAdverts.init().then(function () {
                expect($('.ad-slot', $fixturesContainer).data('name')).toBe('right');
                done();
            });
        });
    });
});
