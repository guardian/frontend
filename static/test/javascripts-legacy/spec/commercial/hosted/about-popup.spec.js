define([
    'lib/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    $,
    fixtures,
    Injector
) {
    var hostedAboutPopup,
        injector = new Injector();

    describe('Hosted About Popup', function () {

        var fixturesConfig = {
                id: 'hosted-about-popup',
                fixtures: [
                    '<div class="survey-overlay-simple js-survey-overlay u-h"></div>' +
                    '<div class="js-hosted-about"></div>'
                ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/hosted/about'
            ], function () {
                hostedAboutPopup = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(hostedAboutPopup).toBeDefined();
        });

        it('should hide popup after initialization', function (done) {
            hostedAboutPopup.init()
                .then(function () {
                    expect($('.js-survey-overlay', $fixturesContainer).hasClass('u-h')).toBeTruthy();
                })
                .then(done)
                .catch(done.fail);
        });

        it('should show popup after clicking on the button', function (done) {
            hostedAboutPopup.init()
                .then(function () {
                    document.querySelector('.js-hosted-about').click();
                    expect($('.js-survey-overlay', $fixturesContainer).hasClass('u-h')).toBeFalsy();
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
