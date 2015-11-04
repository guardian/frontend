define([
    'common/utils/$',
    'helpers/fixtures',
    'common/modules/commercial/creatives/gu-style-comcontent'
], function (
    $,
    fixtures,
    GustyleComcontent
) {
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

        it('can render slot', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            gustyleComcontent = new GustyleComcontent($('.ad-slot', $fixturesContainer), {});
            expect(gustyleComcontent).toBeDefined();
        });

    });
});
