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
        gustyle;

    describe('GU Style', function () {
        var fixturesConfig = {
                id: 'gustyle',
                fixtures: [
                    '<div class="ad-slot-test"></div>'
                ]
            },
            adSlot, adType;

        beforeEach(function (done) {
            injector.require(['common/modules/commercial/gustyle/gustyle'], function () {
                Sut = arguments[0];

                fixtures.render(fixturesConfig);

                adSlot = $('.ad-slot-test');
                adType =  {
                    type: 'gu-style',
                    variant: 'content'
                };

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
