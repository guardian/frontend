import bonzo from 'bonzo';
import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Injector from 'helpers/injector';

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
        frontCommercialComponents, config;

    beforeEach(function (done) {
        injector.test(['common/modules/commercial/front-commercial-components', 'common/utils/config'], function () {
            frontCommercialComponents = arguments[0];
            config = arguments[1];
            config.page = {
                isFront: true,
                hasPageSkin: false
            };
            config.switches = {
                commercialComponents: true
            };

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
        frontCommercialComponents.init();

        fastdom.defer(function () {
            expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            done();
        });
    });

    it('should place ad between 1st and 2nd containers if there are less than 4 containers', function (done) {
        for (var i = 0; i < 2; i++) {
            appendContainer($fixturesContainer);
        }
        frontCommercialComponents.init();

        fastdom.defer(function () {
            expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');
            expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
            done();
        });
    });

    it('should place ad between between the 4th and 5th container if a network front', function (done) {
        config.page.contentType = 'Network Front';

        for (var i = 0; i < 5; i++) {
            appendContainer($fixturesContainer);
        }
        frontCommercialComponents.init();

        fastdom.defer(function () {
            expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');

            expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
            done();
        });
    });

    it('should have 1,1 slot for wide breakpoint if there is a page skin', function (done) {
        for (var i = 0; i < 2; i++) {
            appendContainer($fixturesContainer);
        }
        config.page.hasPageSkin = true;
        frontCommercialComponents.init();

        fastdom.defer(function () {
            expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
            expect($('.ad-slot', $fixturesContainer).attr('data-wide')).toBe('1,1');
            done();
        });
    });

    it('should not display ad slot if commercial-components switch is off', function () {
        config.switches.commercialComponents = false;

        expect(frontCommercialComponents.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });

    it('should not display ad slot if not a front', function () {
        config.page.isFront = false;

        expect(frontCommercialComponents.init()).toBe(false);
        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });

    it('should not display ad slot if there is less than two containers', function () {
        appendContainer($fixturesContainer);
        frontCommercialComponents.init();

        expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
    });

});


