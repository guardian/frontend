define([
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    $,
    fixtures,
    Injector
) {
    var nextVideoAutoplay,
        injector = new Injector();

    describe('Next video autoplay', function () {

        var fixturesConfig = {
                id: 'next-video-autoplay',
                fixtures: [
                    '<div><video data-duration="160">' +
                    '<source type="video/mp4" src="">' +
                    '</video></div>' +
                    '<div class="js-hosted-next-autoplay">' +
                    '<div class="js-autoplay-timer" data-next-page="/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode2">10s</div>' +
                    '</div>' +
                    '<button class="js-autoplay-cancel">' +
                    '</button>'
                ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/hosted/next-video-autoplay'
            ], function () {
                nextVideoAutoplay = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            console.log(nextVideoAutoplay);
            expect(nextVideoAutoplay).toBeDefined();
        });

        xit('should trigger autoplay when there is a next video', function (done) {
            expect(nextVideoAutoplay.canAutoplay()).toBeTruthy();
            done();
        });

        xit('should not trigger autoplay when there is no next video', function (done) {
            fixturesConfig = {
                id: 'next-video-autoplay',
                fixtures: [
                    '<div class="js-autoplay-timer" data-next-page="">10s</div>'
                ]
            };
            $fixturesContainer = fixtures.render(fixturesConfig);
            expect(nextVideoAutoplay.canAutoplay()).toBeFalsy();
            done();
        });

        xit('should show end slate information', function (done) {
            nextVideoAutoplay.triggerEndSlate();
            expect($('.js-hosted-next-autoplay', $fixturesContainer).hasClass('js-autoplay-start')).toBeTruthy();
            done();
        });

        xit('should hide end slate information when cancel button is clicked', function (done) {
            nextVideoAutoplay.addCancelListener();
            document.querySelector('.js-autoplay-cancel').click();
            expect($('.js-hosted-next-autoplay', $fixturesContainer).hasClass('hosted-slide-out')).toBeTruthy();
            done();
        });
    });
});
