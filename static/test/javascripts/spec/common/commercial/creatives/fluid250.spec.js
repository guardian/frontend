define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'common/modules/commercial/creatives/fluid250'
], function(
    qwery,
    $,
    fixtures,
    Fluid250
) {

    var fixturesConfig = {
        id: 'ad-slot',
        fixtures: [
            '<div class="ad-slot"></div>'
        ]
    };

    describe('Fluid 250', function() {

        var fluid250,
            $fixturesContainer;

        it('should exist', function() {
            expect(Fluid250).toBeDefined();
        });

        it('should be defined', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            fluid250 = new Fluid250(qwery('.ad-slot', $fixturesContainer), {});
            expect(fluid250).toBeDefined();
        });

        it('ad slot should have a proper fluid250 css class', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            fluid250 = new Fluid250(qwery('.ad-slot', $fixturesContainer), {}).create();
            console.log(qwery('.ad-slot'), fluid250);
            expect(qwery('.ad-slot').hasClass('ad-slot__fluid250')).toBe('true');
        });

    });

});

