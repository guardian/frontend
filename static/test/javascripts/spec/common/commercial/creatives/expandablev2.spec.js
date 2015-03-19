define([
    'common/modules/commercial/creatives/expandable-v2',
    'helpers/fixtures',
    'fastdom',
    'qwery'
], function(
    ExpandableV2,
    fixtures,
    fastdom,
    qwery
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
            expandablev2 = new ExpandableV2(qwery('.expandablev2-ad-slot', $fixturesContainer), {});
            expect(expandablev2).toBeDefined();
        });

        it('should always have expand, open and collapse buttons', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableV2(qwery('.expandablev2-ad-slot', $fixturesContainer), {}).create();

            fastdom.defer(function () {
                expect(qwery('.ad-exp--expand').length).toBeGreaterThan(0);
                expect(qwery('.ad-exp-collapse__slide').length).toBeGreaterThan(0);
                done();
            });
        });

        it('should have show more button', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableV2(qwery('.expandablev2-ad-slot', $fixturesContainer), {
                showMoreType: 'plus-only'
            }).create();

            fastdom.defer(function () {
                expect(qwery('.ad-exp__open-button').length).toBe(0);
                expect(qwery('.ad-exp__close-button').length).toBeGreaterThan(0);
                done();
            });
        });
    });
});

