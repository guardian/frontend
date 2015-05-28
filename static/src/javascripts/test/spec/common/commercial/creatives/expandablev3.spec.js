import ExpandableV3 from 'common/modules/commercial/creatives/expandable-v3'
import fixtures from 'helpers/fixtures'
import $ from 'common/utils/$'

var fixturesConfig = {
    id: 'expandablev3-ad-slot',
    fixtures: [
        '<div class="expandablev3-ad-slot"></div>'
    ]
};

describe('Expandable v3', function() {

    var expandableV3,
        $fixturesContainer;

    it('should exist', function() {
        expect(ExpandableV3).toBeDefined();
    });

    it('should be always defined', function () {
        $fixturesContainer = fixtures.render(fixturesConfig);
        expandableV3 = new ExpandableV3($('.expandablev3-ad-slot'), {});
        expect(expandableV3).toBeDefined();
    });

    it('should always have expand, open and collapse buttons', function () {
        $fixturesContainer = fixtures.render(fixturesConfig);
        new ExpandableV3($('.expandablev3-ad-slot', $fixturesContainer), {}).create();
        expect($('.ad-exp--expand').length).toBeGreaterThan(0);
        expect($('.ad-exp-collapse__slide').length).toBeGreaterThan(0);
    });

    it('should have show more button', function () {
        $fixturesContainer = fixtures.render(fixturesConfig);
        new ExpandableV3($('.expandablev3-ad-slot', $fixturesContainer), {
            showPlus: 'plus-only'
        }).create();
        expect($('.ad-exp__close-button').length).toBeGreaterThan(0);
    });

});
