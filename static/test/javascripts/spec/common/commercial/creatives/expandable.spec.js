define([
    'common/modules/commercial/creatives/expandable',
    'helpers/fixtures',
    'qwery'
], function(
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

    describe('Expandable', function() {

        var expandable,
            $fixturesContainer;

        it('should exist', function() {
            expect(Expandable).toBeDefined();
        });

        it('should be always defined', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            expandable = new Expandable(qwery('.expandable-ad-slot'), {
                clickMacro: 'clickMacro',
                slide1: 'slide1'
            });
            expect(expandable).toBeDefined();
        });

        it('should have expand and close buttons', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);
            expandable = new Expandable(qwery('.expandable-ad-slot'), {
                clickMacro: 'clickMacro',
                slide1: 'slide1'
            });
            expandable.create();
            expect(qwery('.ad-exp--expand').length).toBe(1);
            expect(qwery('.ad-exp__close-button').length).toBe(1);
        });

    });

});

