define([
    'bonzo',
    'qwery',
    'helpers/fixtures',
    'common/utils/$',
    'common/modules/commercial/front-commercial-components'
], function(
    bonzo,
    qwery,
    fixtures,
    $,
    frontCommercialComponents
){

    describe('Front Commercial Components', function() {

        var fixturesConfig = {
                id: 'front-commercial-component',
                fixtures: [
                    ''
                ]
            },
            appendContainer = function(fixture) {
                bonzo(fixture).append('<div class="container"></div>');
            },
            fixture,
            config;

        beforeEach(function() {
            fixtures.render(fixturesConfig);
            fixture = qwery('#' + fixturesConfig.id)[0];
            config = {
                switches: {
                    commercialComponents: true
                },
                page: {
                    isFront: true,
                    hasPageSkin: false
                }
            };
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
            frontCommercialComponents.reset();
        });

        it('should exist', function() {
            expect(frontCommercialComponents).toBeDefined();
        });

        it('should not display ad slot if commercial-components switch is off', function() {
            config.switches.commercialComponents = false;
            expect(frontCommercialComponents.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should not display ad slot if not a front', function() {
            config.page.isFront = false;
            expect(frontCommercialComponents.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should not display ad slot if there is a page skin', function() {
            config.page.hasPageSkin = true;
            expect(frontCommercialComponents.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should place ad between 2nd and 3rd containers if there are 4 or more containers', function() {
            '1234'.split('').forEach(function() {
                appendContainer(fixture);
            })
            frontCommercialComponents.init(config);
            expect(qwery('.ad-slot', fixture).length).toBe(1);
            expect($('#' + fixturesConfig.id + '> *:nth-child(2)').next().hasClass('ad-slot')).toBe(true);
        });

        it('should place ad between 1st and 2nd containers if there are 2 or 3 containers', function() {
            '12'.split('').forEach(function() {
                appendContainer(fixture);
            })
            frontCommercialComponents.init(config);
            expect(qwery('.ad-slot', fixture).length).toBe(1);
            expect($('#' + fixturesConfig.id + '> *:nth-child(1)').next().hasClass('ad-slot')).toBe(true);
        });

        it('should not display ad slot if there is less than two containers', function() {
            appendContainer(fixture);
            frontCommercialComponents.init(config);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

    });

});
