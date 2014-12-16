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

    return new Injector()
        .store(['common/utils/config'])
        .require(['common/modules/commercial/front-commercial-components', 'mocks'], function (frontCommercialComponents, mocks) {

            describe('Front Commercial Components', function () {

                var fixturesConfig = {
                        id: 'front-commercial-component',
                        fixtures: []
                    },
                    appendContainer = function ($fixturesContainer) {
                        $fixturesContainer.append('<div class="fc-container"></div>');
                    },
                    $fixturesContainer;

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        isFront: true,
                        hasPageSkin: false
                    };
                    mocks.store['common/utils/config'].switches = {
                        commercialComponents: true
                    };

                    $fixturesContainer = fixtures.render(fixturesConfig);
                });

                afterEach(function () {
                    fixtures.clean(fixturesConfig.id);
                });

                it('should exist', function () {
                    expect(frontCommercialComponents).toBeDefined();
                });

                it('should place ad between 3rd and 4th containers if there are 4 or more containers', function () {
                    '1234'.split('').forEach(function () {
                        appendContainer($fixturesContainer);
                    });
                    frontCommercialComponents.init();

                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                });

                it('should place ad between 1st and 2nd containers if there are less than 4 containers', function () {
                    '12'.split('').forEach(function () {
                        appendContainer($fixturesContainer);
                    });
                    frontCommercialComponents.init();

                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                    var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');
                    expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
                });

                it('should place ad between between the 4th and 5th container if a network front', function () {
                    mocks.store['common/utils/config'].page.contentType = 'Network Front';

                    '12345'.split('').forEach(function () {
                        appendContainer($fixturesContainer);
                    });
                    frontCommercialComponents.init();

                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                    var adSlot = $('#' + fixturesConfig.id + ' > .fc-container > *');

                    expect(bonzo(adSlot).hasClass('ad-slot')).toBe(true);
                });

                it('should not display ad slot if commercial-components switch is off', function () {
                    mocks.store['common/utils/config'].switches.commercialComponents = false;

                    expect(frontCommercialComponents.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });

                it('should not display ad slot if not a front', function () {
                    mocks.store['common/utils/config'].page.isFront = false;

                    expect(frontCommercialComponents.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });

                it('should not display ad slot if there is a page skin', function () {
                    mocks.store['common/utils/config'].page.hasPageSkin = true;

                    expect(frontCommercialComponents.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });

                it('should not display ad slot if there is less than two containers', function () {
                    appendContainer($fixturesContainer);
                    frontCommercialComponents.init();

                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                });

            });

        });

});
