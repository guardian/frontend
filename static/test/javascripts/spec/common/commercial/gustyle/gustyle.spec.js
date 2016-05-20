define([
    'helpers/injector',
    'common/utils/$',
    'fastdom',
    'helpers/fixtures'
], function (
    Injector,
    $,
    fastdom,
    fixtures
) {
    var Sut, // System under test
        injector = new Injector(),
        gustyle,
        config;

    describe('GU Style', function () {
        var fixturesConfig = {
                id: 'gustyle',
                fixtures: [
                    '<div class="ad-slot-test"></div>'
                ]
            },
            adSlot, adType;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/gustyle/gustyle',
                'common/utils/config'
                ], function () {
                Sut = arguments[0];
                config = arguments[1];

                fixtures.render(fixturesConfig);

                adSlot = $('.ad-slot-test');
                adType = 'gu-style';

                config.page.isContent = false;

                done();
            });
        });

        afterEach(function () {
            gustyle = null;
            fixtures.clean(fixturesConfig.id);
        });

        it('should create new instance with slot and ad type in parameters', function () {
            gustyle = new Sut(adSlot, adType);
            expect(gustyle.$slot).toEqual(adSlot);
            expect(gustyle.params).toEqual(adType);
        });

        it('should set escape usual ad slot boundaries', function (done) {
            gustyle = new Sut(adSlot, adType);
            gustyle.addLabel();

            fastdom.defer(function () {
                expect(adSlot.hasClass('gu-style')).toBeTruthy();
                done();
            });
        });

        it('should set gu-style--unboxed class on content pages', function (done) {
            config.page.isContent = true;
            gustyle = new Sut(adSlot, adType);
            gustyle.addLabel();

            fastdom.defer(function () {
                expect(adSlot.hasClass('gu-style--unboxed')).toBeTruthy();
                done();
            });
        });

        it('should add label', function (done) {
            gustyle = new Sut(adSlot, adType);
            gustyle.addLabel();

            fastdom.defer(function () {
                expect($('.gu-comlabel').length).toEqual(1);
                done();
            });
        });
    });
});
