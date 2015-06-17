import Expandable from 'common/modules/commercial/creatives/expandable';
import qwery from 'qwery';
import fixtures from 'helpers/fixtures';

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
        expandable = new Expandable(qwery('.expandable-ad-slot', $fixturesContainer), {});
        expect(expandable).toBeDefined();
    });

    it('should always have expand and close buttons', function () {
        $fixturesContainer = fixtures.render(fixturesConfig);
        new Expandable(qwery('.expandable-ad-slot', $fixturesContainer), {}).create();
        expect(qwery('.ad-exp--expand').length).toBe(1);
        expect(qwery('.ad-exp__close-button').length).toBe(1);
    });

});
