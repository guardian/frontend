define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'jasq'
], function (
    qwery,
    $,
    fixtures
) {

    describe('Front Commercial Components', {
        moduleName: 'common/modules/commercial/front-commercial-components',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            commercialComponents: true
                        },
                        page: {
                            isFront: true,
                            hasPageSkin: false
                        }
                    };
                }
            }
        },
        specify: function () {

            var fixturesConfig = {
                    id: 'front-commercial-component',
                    fixtures: []
                },
                appendContainer = function ($fixturesContainer) {
                    $fixturesContainer.append('<div class="container"></div>');
                },
                $fixturesContainer;

            beforeEach(function () {
                $fixturesContainer = fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
            });

            it('should exist', function (frontCommercialComponents) {
                expect(frontCommercialComponents).toBeDefined();
            });

            it(
                'should place ad between 3rd and 4th containers if there are 4 or more containers',
                function (frontCommercialComponents) {
                    '1234'.split('').forEach(function () {
                        appendContainer($fixturesContainer);
                    });
                    frontCommercialComponents.init();
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                    expect($('#' + fixturesConfig.id + '> *:nth-child(3)').next().hasClass('ad-slot')).toBe(true);
                }
            );

            it(
                'should place ad between 1st and 2nd containers if there are less than 4 containers',
                function (frontCommercialComponents) {
                    '12'.split('').forEach(function () {
                        appendContainer($fixturesContainer);
                    });
                    frontCommercialComponents.init();
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(1);
                    expect($('#' + fixturesConfig.id + '> *:nth-child(1)').next().hasClass('ad-slot')).toBe(true);
                }
            );

            it(
                'should not display ad slot if commercial-components switch is off',
                function (frontCommercialComponents, deps) {
                    deps['common/utils/config'].switches.commercialComponents = false;
                    expect(frontCommercialComponents.init()).toBe(false);
                    expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
                }
            );

            it('should not display ad slot if not a front', function (frontCommercialComponents, deps) {
                deps['common/utils/config'].page.isFront = false;
                expect(frontCommercialComponents.init()).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            });

            it('should not display ad slot if there is a page skin', function (frontCommercialComponents, deps) {
                deps['common/utils/config'].page.hasPageSkin = true;
                expect(frontCommercialComponents.init()).toBe(false);
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            });

            it('should not display ad slot if there is less than two containers', function (frontCommercialComponents) {
                appendContainer($fixturesContainer);
                frontCommercialComponents.init();
                expect(qwery('.ad-slot', $fixturesContainer).length).toBe(0);
            });

        }
    });

});
