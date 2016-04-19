define([
    'qwery',
    'common/utils/$',
    'helpers/fixtures',
    'common/modules/commercial/creatives/gu-style-comcontent'
], function (
    qwery,
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

        it('ad slot should have text and header at the bottom', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleContentPosition: 'bottom'
            }).create();
            expect(qwery('.gu-display__content-position--bottom', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have text and header on top', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleContentPosition: 'top'
            }).create();
            expect(qwery('.gu-display__content-position--top', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have bright font colour', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleContentColor: 'bright'
            }).create();
            expect(qwery('.gu-display__content-color--bright', '.ad-slot').length).toBe(4);
        });

        it('ad slot should have dark font colour', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleContentColor: 'dark'
            }).create();
            expect(qwery('.gu-display__content-color--dark', '.ad-slot').length).toBe(4);
        });

        it('ad slot should have regular font size header', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleHeaderFontSize: 'regular'
            }).create();
            expect(qwery('.gu-display__content-size--regular', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have big font size header', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleHeaderFontSize: 'big'
            }).create();
            expect(qwery('.gu-display__content-size--big', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have small font size text', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleTextFontSize: 'small'
            }).create();
            expect(qwery('.gu-display__content-size--small', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have big font size text and header', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                articleTextFontSize: 'big',
                articleHeaderFontSize: 'big'
            }).create();
            expect(qwery('.gu-display__content-size--big', '.ad-slot').length).toBe(2);
        });

        it('ad slot should have logo in the top left corner', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                brandLogoPosition: 'top-left'
            }).create();
            expect(qwery('.gu-display__logo-pos--top-left', '.ad-slot').length).toBe(1);
        });

        it('ad slot should have logo in the bottom right corner', function () {
            $fixturesContainer = fixtures.render(fixturesConfig);

            new GustyleComcontent($('.ad-slot', $fixturesContainer), {
                brandLogoPosition: 'bottom-right'
            }).create();
            expect(qwery('.gu-display__logo-pos--bottom-right', '.ad-slot').length).toBe(1);
        });

    });
});
