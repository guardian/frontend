define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'helpers/injector'
], function(
    qwery,
    $,
    fixtures,
    Injector
) {

    var config = {
            images: {
                commercial: { }
            },
            page: {
                section: 'football'
            }
        },
        fixturesConfig = {
            id: 'js-secondary-column',
            fixtures: [
                '<div class="js-secondary-column"></div>'
            ]
        };

    return new Injector()
        .mock({
            'common/utils/config': config
        })
        .require(['common/modules/commercial/creatives/branded-component'], function (BrandedComponent) {

            describe('Branded Component', function() {

                var brandedComponent,
                    $fixturesContainer;

                it('should exist', function() {
                    expect(BrandedComponent).toBeDefined();
                });

                it('should be always defined', function () {
                    brandedComponent = new BrandedComponent(qwery('.branded-component-soulmates'), {
                        type: 'soulmates',
                        clickMacro: '%%CLICK_URL_ESC%%',
                        omnitureId: 'omnitureId'
                    }, {
                        force: true
                    });
                    expect(brandedComponent).toBeDefined();
                });

                it('should always show branded component with force option', function () {
                    $fixturesContainer = fixtures.render(fixturesConfig);

                    brandedComponent.create();
                    expect(qwery('.creative--branded-component-soulmates').length).toBe(1);
                });

                it('should not show branded component without force option and in football section', function () {
                    $fixturesContainer = fixtures.render(fixturesConfig);
                    brandedComponent = new BrandedComponent(qwery('.branded-component-soulmates'), {
                        type: 'soulmates',
                        clickMacro: '%%CLICK_URL_ESC%%',
                        omnitureId: 'omnitureId'
                    }, {
                        force: false
                    });

                    brandedComponent.create();
                    expect(qwery('.creative--branded-component-soulmates').length).toBe(0);
                });

                it('should show branded component without force option, long secondary column and not in football', function () {
                    $fixturesContainer = fixtures.render(fixturesConfig);
                    $('.js-secondary-column').css('height', 1900);
                    config.page.section = '';
                    brandedComponent = new BrandedComponent(qwery('.branded-component-soulmates'), {
                        type: 'soulmates',
                        clickMacro: '%%CLICK_URL_ESC%%',
                        omnitureId: 'omnitureId'
                    }, {
                        force: false
                    });

                    brandedComponent.create();
                    expect(qwery('.creative--branded-component-soulmates').length).toBe(1);
                });

            });

        });

});

