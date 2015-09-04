import qwery from 'qwery';
import $ from 'common/utils/$';
import fixtures from 'helpers/fixtures';
import GustyleComcontent from 'common/modules/commercial/creatives/gu-style-comcontent';

var fixturesConfig = {
    id: 'ad-slot',
    fixtures: [
        '<div class="ad-slot"></div>'
    ]
};

describe('GU-style Commercial Content', function () {

    var gustyleComcontent,
        $fixturesContainer;

    it('should exist', function () {
        expect(GustyleComcontent).toBeDefined();
    });

    it('should be defined', function () {
        $fixturesContainer = fixtures.render(fixturesConfig);

        gustyleComcontent = new GustyleComcontent($('.ad-slot', $fixturesContainer), {});
        expect(gustyleComcontent).toBeDefined();
    });

});
