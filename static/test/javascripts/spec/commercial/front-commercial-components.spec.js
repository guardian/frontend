define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    bonzo,
    qwery,
    $,
    fixtures,
    Injector
) {
    describe('Front Commercial Components', function () {

        var fixturesConfig = {
                id: 'front-commercial-component',
                fixtures: []
            },
            appendContainer = function ($container) {
                $container.append('<div class="fc-container"></div>');
            },
            $fixturesContainer,
            injector = new Injector(),
            frontCommercialComponents, config, commercialFeatures;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/front-commercial-components',
                'common/modules/commercial/commercial-features',
                'common/utils/config'
            ], function () {
                frontCommercialComponents = arguments[0];
                commercialFeatures = arguments[1];
                config = arguments[2];

                config.page = {
                    isFront: true,
                    hasPageSkin: false
                };
                commercialFeatures.frontCommercialComponents = true;

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(frontCommercialComponents).toBeDefined();
        });

        it('should place ad between 3rd and 4th containers if there are 4 or more containers', function (done) {
            for (var i = 0; i < 4; i++) {
                appendContainer($fixturesContainer);
            }
            frontCommercialComponents.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should place ad between 1st and 2nd containers if there are less than 4 containers', function (done) {
            for (var i = 0; i < 2; i++) {
                appendContainer($fixturesContainer);
            }
            frontCommercialComponents.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');
                expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should place ad between between the 4th and 5th container if a network front', function (done) {
            config.page.contentType = 'Network Front';

            for (var i = 0; i < 5; i++) {
                appendContainer($fixturesContainer);
            }
            frontCommercialComponents.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');

                expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should have 1,1 slot for wide breakpoint if there is a page skin', function (done) {
            for (var i = 0; i < 2; i++) {
                appendContainer($fixturesContainer);
            }
            config.page.hasPageSkin = true;
            frontCommercialComponents.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                expect($('.ad-slot', $fixturesContainer).attr('data-wide')).toBe('2,2');
            })
            .then(done)
            .catch(done.fail);
        });

        it('it should not display ad slot if commercial-features switch is disabled', function (done) {
            commercialFeatures.frontCommercialComponents = false;

            frontCommercialComponents.init()
            .then(function(result) {
                expect(result).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            })
            .then(done)
            .catch(done.fail);
        });

        it('should not display ad slot if there is less than two containers', function (done) {
            appendContainer($fixturesContainer);
            frontCommercialComponents.init()
            .then(function () {
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            })
            .then(done)
            .catch(done.fail);
        });

    });
});
