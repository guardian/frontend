define([
    'lib/$',
    'helpers/fixtures',
    'fastdom',
    'helpers/injector'
], function (
    $,
    fixtures,
    fastdom,
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
            fixturesConfigNoVideo = {
                id: 'next-video-not-autoplay',
                fixtures: [
                    '<div class="js-autoplay-timer" data-next-page="">10s</div>'
                ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.mock('common/modules/analytics/google', function noop() {});
            injector.mock('commercial/modules/hosted/next-video',  {
                load: function() { return Promise.resolve() },
                init: function() { return Promise.resolve() }
            });
            injector.require([
                'commercial/modules/hosted/next-video-autoplay'
            ], function () {
                nextVideoAutoplay = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                nextVideoAutoplay.init().then(done);
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
            fixtures.clean(fixturesConfigNoVideo.id);
        });

        it('should exist', function (done) {
            expect(nextVideoAutoplay).toBeDefined();
            done();
        });

        it('should trigger autoplay when there is a next video', function (done) {
            expect(nextVideoAutoplay.canAutoplay()).toBeTruthy();
            done();
        });

        it('should show end slate information', function (done) {
            nextVideoAutoplay.triggerEndSlate();
            fastdom.read(function () {
                expect($('.js-hosted-next-autoplay', $fixturesContainer).hasClass('js-autoplay-start')).toBeTruthy();
                done();
            });
        });

        it('should hide end slate information when cancel button is clicked', function (done) {
            nextVideoAutoplay.addCancelListener();
            document.querySelector('.js-autoplay-cancel').click();
            fastdom.read(function () {
                expect($('.js-hosted-next-autoplay', $fixturesContainer).hasClass('hosted-slide-out')).toBeTruthy();
                done();
            });
        });

        it('should not trigger autoplay when there is no next video', function (done) {
            fixtures.clean(fixturesConfig.id);
            $fixturesContainer = fixtures.render(fixturesConfigNoVideo);
            nextVideoAutoplay.init().then(function(){
                expect(nextVideoAutoplay.canAutoplay()).toBeFalsy();
                done();
            });
        });
    });
});
