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

            fluid250 = new Fluid250($('.ad-slot', $fixturesContainer), {});
            expect(fluid250).toBeDefined();
        });

        xit('ad slot should always have a proper fluid250 css class', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new Fluid250($('.ad-slot', $fixturesContainer), {}).create();
            expect($('.ad-slot').hasClass('ad-slot__fluid250')).toBe(true);
        });

        it('ad slot should have a video iframe with proper styles', function() {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new Fluid250($('.ad-slot', $fixturesContainer), {
                videoPositionH: 'left',
                videoHorizSpace: 10,
                videoPositionV: 'top',
                videoURL: 'exampleVideoUrl'
            }).create();
            expect(qwery('.fluid250_video--vert-pos-top', '.ad-slot').length).toBe(1);
            expect(qwery('.fluid250_video--horiz-pos-left', '.ad-slot').length).toBe(1);
        });

    });

});

