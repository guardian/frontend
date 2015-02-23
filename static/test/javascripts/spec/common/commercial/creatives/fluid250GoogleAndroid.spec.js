define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'common/modules/commercial/creatives/fluid250GoogleAndroid'
], function(
    qwery,
    $,
    fixtures,
    Fluid250GoogleAndroid
) {

    var fixturesConfig = {
        id: 'ad-slot',
        fixtures: [
            '<div class="ad-slot"></div>'
        ]
    };

    describe('Fluid 250 Google Android', function() {

        var fluid250GoogleAndroid,
            $fixturesContainer;

        it('should exist', function() {
            expect(Fluid250GoogleAndroid).toBeDefined();
        });

        it('should be defined', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            fluid250GoogleAndroid = new Fluid250GoogleAndroid($('.ad-slot', $fixturesContainer), {});
            expect(fluid250GoogleAndroid).toBeDefined();
        });

        xit('ad slot should always have a proper fluid250 css class', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new Fluid250GoogleAndroid($('.ad-slot', $fixturesContainer), {}).create();
            expect($('.ad-slot').hasClass('ad-slot__fluid250')).toBe(true);
        });

    });

});

