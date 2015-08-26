import ExpandableVideo from 'common/modules/commercial/creatives/expandable-video';
import fixtures from 'helpers/fixtures';
import $ from 'common/utils/$';

var fixturesConfig = {
    id: 'expandablevideo-ad-slot',
    fixtures: [
        '<div class="expandablevideo-ad-slot"></div>'
    ]
};

describe('Expandable Video', function () {

    var expandableVideo;

    it('should exist', function () {
        expect(ExpandableVideo).toBeDefined();
    });

    it('should be always defined', function () {
        fixtures.render(fixturesConfig);
        expandableVideo = new ExpandableVideo($('.expandablevideo-ad-slot'), {});
        expect(expandableVideo).toBeDefined();
    });

});
