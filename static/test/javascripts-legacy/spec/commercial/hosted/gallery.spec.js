define([
    'lib/$',
    'lib/mediator',
    'helpers/fixtures',
    'Promise',
    'fastdom',
    'raw-loader!fixtures/commercial/hosted/gallery.html',
    'helpers/injector'
], function (
    $,
    mediator,
    fixtures,
    Promise,
    fastdom,
    galleryHtml,
    Injector
) {
    var gallery,
        interactionTracking = { trackNonClickInteraction : sinon.stub() },
        noop = function () {},
        injector = new Injector();

    describe('Hosted Gallery', function () {

        var fixturesConfig = {
                id: 'hosted-gallery',
                fixtures: [ galleryHtml ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.mock('common/modules/analytics/interaction-tracking', interactionTracking);
            injector.mock('lib/load-css-promise', Promise.resolve());
            injector.mock('commercial/modules/dfp/performance-logging', {moduleStart: noop, moduleEnd: noop});
            injector.mock('lib/mediator', mediator);

            injector.require([
                'commercial/modules/hosted/gallery'
            ], function (galleryModule) {
                $fixturesContainer = fixtures.render(fixturesConfig);
                galleryModule.init(noop, noop);
                mediator.on('page:hosted:gallery', function(instance) {
                    gallery = instance;
                    done();
                });
            });
        });

        afterEach(function () {
            interactionTracking.trackNonClickInteraction.reset();
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function (done) {
            expect(gallery).toBeDefined();
            done();
        });

        it('should open and close the caption on click', function (done) {
            var button = document.querySelector('.js-gallery-caption-button');
            button.click();
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeTruthy();
            button.click();
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeFalsy();
            done();
        });

        it('should open and close  the caption on pressing "i"', function (done) {
            gallery.handleKeyEvents({keyCode : 73});
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeTruthy();
            gallery.handleKeyEvents({keyCode : 73});
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeFalsy();
            done();
        });

        it('should open and close the onward journey on click', function (done) {
            var button = document.querySelector('.js-hosted-gallery-oj-close');
            button.click();
            expect($('.js-hosted-gallery-oj', $fixturesContainer).hasClass('minimise-oj')).toBeTruthy();
            button.click();
            expect($('.js-hosted-gallery-oj', $fixturesContainer).hasClass('minimise-oj')).toBeFalsy();
            done();
        });

        it('should log navigation in GA when using arrow key navigation', function (done) {
            gallery.handleKeyEvents({keyCode : 40, preventDefault: noop});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("KeyPress:down - image 2");
            gallery.handleKeyEvents({keyCode : 39, preventDefault: noop});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("KeyPress:right - image 3");
            gallery.handleKeyEvents({keyCode : 38, preventDefault: noop});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("KeyPress:up - image 2");
            gallery.handleKeyEvents({keyCode : 37, preventDefault: noop});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("KeyPress:left - image 1");
            done();
        });

        it('should log navigation in GA when clicking through images', function (done) {
            gallery.initScroll.call(gallery);
            document.querySelector('.inline-arrow-down').click();
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("Click - image 2");
            document.querySelector('.inline-arrow-up').click();
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("Click - image 1");
            done();
        });

        it('should log navigation in GA when scrolling through images', function (done) {
            gallery.fadeContent({target: {
                scrollTop: 20,
                scrollHeight: 30
            }});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("Scroll - image 3");
            done();
        });

    });
});
