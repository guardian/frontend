define([
    'common/modules/commercial/creatives/expandable-video-v2',
    'helpers/fixtures',
    'common/utils/$'
], function (
    ExpandableVideo,
    fixtures,
    $
) {
    var fixturesConfig = {
        id: 'expandablevideo-ad-slot',
        fixtures: [
            '<div class="expandablevideo-ad-slot"></div>'
        ]
    };

    describe('Expandable Video', function () {

        var expandableVideo,
        $fixturesContainer;

        it('should exist', function () {
            expect(ExpandableVideo).toBeDefined();
        });

        it('should be always defined', function () {
            fixtures.render(fixturesConfig);
            expandableVideo = new ExpandableVideo($('.expandablevideo-ad-slot'), {});
            expect(expandableVideo).toBeDefined();
        });

        it('should always have expand, open and collapse buttons', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableVideo($('.expandablevideo-ad-slot', $fixturesContainer), {})
            .create().then(function () {
                expect($('.ad-exp--expand').length).toBeGreaterThan(0);
                expect($('.ad-exp-collapse__slide').length).toBeGreaterThan(0);
                done();
            });
        });

        it('should have show more button', function (done) {
            $fixturesContainer = fixtures.render(fixturesConfig);
            new ExpandableVideo($('.expandablevideo-ad-slot', $fixturesContainer), {
                showMoreType: 'plus-only'
            }).create().then(function () {
                expect($('.ad-exp__close-button').length).toBeGreaterThan(0);
                done();
            });
        });

    });

});
