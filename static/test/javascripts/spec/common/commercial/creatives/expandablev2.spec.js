define([
    'common/modules/commercial/creatives/expandable-v2',
    'helpers/fixtures',
    'common/utils/$'
], function(
    ExpandableV2,
    fixtures,
    $
) {

    var fixturesConfig = {
        id: 'expandablev2-ad-slot',
        fixtures: [
            '<div class="expandablev2-ad-slot"></div>'
        ]
    };

    describe('Expandable v2', function() {

        var expandablev2,
            $fixturesContainer;

        it('should exist', function() {
            expect(ExpandableV2).toBeDefined();
        });

        it('should be always defined', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            expandablev2 = new ExpandableV2($('.expandablev2-ad-slot'), {});
            expect(expandablev2).toBeDefined();
        });

        it('should always have expand, open and collapse buttons', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableV2($('.expandablev2-ad-slot', $fixturesContainer), {}).create();
            expect($('.ad-exp--expand').length).toBeGreaterThan(0);
            expect($('.ad-exp-collapse__slide').length).toBeGreaterThan(0);
        });

        it('should have show more button', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableV2($('.expandablev2-ad-slot', $fixturesContainer), {
                showPlus: 'plus-only'
            }).create();
            expect($('.ad-exp__close-button').length).toBeGreaterThan(0);
        });

    });

});

