import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import Fluid250GoogleAndroid from 'common/modules/commercial/creatives/fluid250GoogleAndroid';

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

});
