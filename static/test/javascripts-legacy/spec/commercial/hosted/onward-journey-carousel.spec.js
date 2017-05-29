define([
    'lib/$',
    'lib/fastdom-promise',
    'helpers/fixtures',
    'raw-loader!fixtures/commercial/hosted/onward-journey-carousel.html',
    'helpers/injector'
], function ($,
             fastdom,
             fixtures,
             carouselHtml,
             Injector) {
    var hostedOnwardCarousel,
        injector = new Injector();

    describe('Hosted onward journey carousel', function () {

        var fixturesConfig = {
                id: 'hosted-onward-journey-carousel',
                fixtures: [
                    carouselHtml
                ]
            },
            $fixturesContainer;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/hosted/onward-journey-carousel'
            ], function () {
                hostedOnwardCarousel = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(hostedOnwardCarousel).toBeDefined();
        });

        it('should show next page on clicking arrow buttons', function (done) {
            hostedOnwardCarousel.initHostedCarousel()
                .then(function () {
                    document.querySelector('.next-oj-item').click();
                    return expectToBeOnNthPage(2);
                })
                .then(function () {
                    document.querySelector('.next-oj-item').click();
                    return expectToBeOnNthPage(3);
                })
                .then(function () {
                    document.querySelector('.prev-oj-item').click();
                    return expectToBeOnNthPage(2);
                })
                .then(function () {
                    document.querySelector('.prev-oj-item').click();
                    return expectToBeOnNthPage(1);
                })
                .then(done)
                .catch(done.fail);
        });

        it('should change page on clicking the dots', function (done) {
            hostedOnwardCarousel.initHostedCarousel()
                .then(function () {
                    document.querySelector('.js-carousel-dot:nth-child(4)').click();
                    return expectToBeOnNthPage(4);
                })
                .then(function () {
                    document.querySelector('.js-carousel-dot:nth-child(2)').click();
                    return expectToBeOnNthPage(2);
                })
                .then(function () {
                    document.querySelector('.js-carousel-dot:nth-child(3)').click();
                    return expectToBeOnNthPage(3);
                })
                .then(function () {
                    document.querySelector('.js-carousel-dot:nth-child(1)').click();
                    return expectToBeOnNthPage(1);
                })
                .then(done)
                .catch(done.fail);
        });

        function expectToBeOnNthPage(n) {
            return fastdom.read(function () {
                var transform = (1 - n) * 100;
                expect($('.js-carousel-pages', $fixturesContainer)[0].attributes['style'].value).toContain('transform: translate(' + transform + '%, 0px)');
                expect($('.js-carousel-dot:nth-child(' + n + ')', $fixturesContainer).hasClass('highlighted')).toBeTruthy();
                [1, 2, 3, 4].forEach(function (i) {
                    if (i != n) {
                        expect($('.js-carousel-dot:nth-child(' + i + ')', $fixturesContainer).hasClass('highlighted')).toBeFalsy();
                    }
                });
            });
        }
    });
});
