define([
    'common/utils/$',
    'helpers/fixtures',
    'Promise',
    'fastdom',
    'text!fixtures/commercial/hosted/gallery.html',
    'helpers/injector'
], function (
    $,
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

    fdescribe('Hosted Gallery', function () {

        var fixturesConfig = {
                id: 'hosted-gallery',
                fixtures: [ galleryHtml ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.mock('common/modules/analytics/interaction-tracking', interactionTracking);
            injector.mock('common/utils/load-css-promise', Promise.resolve());
            injector.mock('commercial/modules/dfp/performance-logging', {moduleStart: noop, moduleEnd: noop});

            injector.require([
                'commercial/modules/hosted/gallery'
            ], function (galleryModule) {
                $fixturesContainer = fixtures.render(fixturesConfig);
                galleryModule.init()
                    .then(function(instance){
                        gallery = instance;
                        done();
                    })
                    .catch(done.fail);
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

        it('should open the caption on click', function (done) {
            document.querySelector('.js-gallery-caption-button').click();
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeTruthy();
            done();
        });

        it('should open the caption on pressing "i"', function (done) {
            gallery.handleKeyEvents({keyCode : 73});
            expect($('.js-gallery-caption-bar', $fixturesContainer).hasClass('hosted-gallery--show-caption')).toBeTruthy();
            done();
        });

        it('should log navigation in GA', function (done) {
            gallery.handleKeyEvents({keyCode : 40, preventDefault: noop});
            expect(interactionTracking.trackNonClickInteraction).toHaveBeenCalledWith("undefinedKeyPress:down - image 2");
            done();
        });

    });
});
