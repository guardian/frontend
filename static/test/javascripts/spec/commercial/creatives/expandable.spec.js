define([
    'commercial/modules/creatives/expandable',
    'helpers/fixtures',
    'qwery'
], function (
    Expandable,
    fixtures,
    qwery
) {
    var fixturesConfig = {
        id: 'expandable-ad-slot',
        fixtures: [
            '<div class="expandable-ad-slot"></div>'
        ]
    };

    describe('Expandable', function () {

        var expandable,
            $fixturesContainer;

        it('should exist', function () {
            expect(Expandable).toBeDefined();
        });

        it('should be always defined', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            expandable = new Expandable(qwery('.expandable-ad-slot', $fixturesContainer), {});
            expect(expandable).toBeDefined();
        });

        it('should always have expand and close buttons', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new Expandable(qwery('.expandable-ad-slot', $fixturesContainer), {}).create()
            .then(function () {
                expect(qwery('.ad-exp--expand', $fixturesContainer).length).toBe(1);
                expect(qwery('.ad-exp__close-button', $fixturesContainer).length).toBe(1);
            })
            .then(done)
            .catch(done.fail);
        });

    });
});
